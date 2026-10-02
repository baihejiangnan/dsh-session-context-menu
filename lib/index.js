import { existsSync, readdirSync, statSync } from "node:fs"
import { rm } from "node:fs/promises"
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path"
import { spawn } from "node:child_process"

export const inject = ["webServer", "sessionPersistence", "workspaceRegistry", "agents", "sessions", "storageDomain"]

const DELETE_ROUTE = "/dsh-session-context-menu/delete"
const OPEN_URL_ROUTE = "/dsh-session-context-menu/open-url"
const MAX_BODY_BYTES = 64 * 1024
const SESSION_ID_RE = /^[A-Za-z0-9_-]+$/

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let data = ""
    request.on("data", (chunk) => {
      data += chunk
      if (data.length > MAX_BODY_BYTES) {
        request.destroy()
        reject(new Error("request body too large"))
      }
    })
    request.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}) } catch { reject(new Error("invalid JSON body")) }
    })
    request.on("error", reject)
  })
}

function respond(response, status, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  })
  response.end(body)
}

function isSameOriginJsonRequest(request) {
  const contentType = request.headers?.["content-type"] || ""
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) return { ok: false, status: 415, error: "unsupported-media-type" }
  const origin = request.headers?.origin
  const host = request.headers?.host
  if (origin && host) {
    let sameOrigin = false
    try { sameOrigin = new URL(origin).host === host } catch {}
    if (!sameOrigin) return { ok: false, status: 403, error: "cross-origin-request" }
  }
  return { ok: true }
}

function safeWebUrl(value) {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null
  } catch {
    return null
  }
}

function spawnDetached(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true })
    child.once("error", reject)
    child.once("spawn", () => {
      child.unref()
      resolve()
    })
  })
}

async function openUrl(url) {
  if (process.platform === "win32") {
    await spawnDetached("rundll32.exe", ["url.dll,FileProtocolHandler", url])
    return
  }
  if (process.platform === "darwin") {
    await spawnDetached("open", [url])
    return
  }
  await spawnDetached("xdg-open", [url])
}

async function stopAgent(agent) {
  if (!agent) return
  if (typeof agent.cancel === "function") {
    try { agent.cancel({ kind: "user" }, { keepInbox: true }) } catch {}
  }
  if (typeof agent.whenIdle === "function") {
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 15_000)
      Promise.resolve(agent.whenIdle()).then(
        () => { clearTimeout(timer); resolve() },
        () => { clearTimeout(timer); resolve() },
      )
    })
  }
}

async function detachLiveSession(ctx, sessionId) {
  const sessions = ctx.get("sessions")
  const session = sessions?.get?.(sessionId)
  if (!session) return false
  if (typeof sessions.flush === "function") {
    try { await sessions.flush(session) } catch {}
  }
  const entry = sessions.store?.get?.(sessionId)
  if (!entry) return false
  if (typeof sessions.detachEntered === "function") sessions.detachEntered(entry)
  else sessions.store.delete(sessionId)
  return true
}

async function removeProjection(ctx, sessionId) {
  const domain = ctx.storageDomain.get("session_projcache")
  const sessions = domain?.table?.("sessions")
  if (sessions?.get(sessionId) !== undefined) await sessions.delete(sessionId)
}

async function removeWorkspaceAccounting(ctx, sessionId) {
  const domain = ctx.storageDomain.get("workspace")
  if (!domain) return
  for (const workspace of ctx.workspaceRegistry.list()) {
    if (workspace.sessionIds.includes(sessionId)) await workspace.detachSession(sessionId)
  }
  const state = domain.global?.get?.()
  if (state?.archivedSessionIds?.includes(sessionId)) {
    const next = {
      ...state,
      archivedSessionIds: state.archivedSessionIds.filter((id) => id !== sessionId),
    }
    if (typeof ctx.workspaceRegistry.setState === "function") await ctx.workspaceRegistry.setState(next)
    else {
      await domain.global.set(next)
      if ("state" in ctx.workspaceRegistry) ctx.workspaceRegistry.state = next
    }
  }
}

/**
 * Resolve the authoritative sessions root.
 *
 * Why not just `process.env.DSH_HOME`: the desktop host process is launched as
 *
 *   "DeepSeek Harness.exe" ... dsh-desktop-host/lib/index.js <dshRoot> <profileDir> ...
 *
 * i.e. the profile directory arrives as a POSITIONAL ARGUMENT, and DSH_HOME is
 * only injected into the tool/subprocess children — not into the host process
 * that loads this plugin. Reading `process.env.DSH_HOME` here therefore returns
 * undefined in the real desktop app, `safeSessionDirectory()` threw
 * "DSH_HOME is unavailable", and every delete failed with that code no matter
 * which session was picked.
 *
 * Order: the persistence backend's own configured root first (that IS the
 * authoritative location, since it is the thing actually writing the logs),
 * then DSH_HOME, then the profile directory recovered from argv.
 *
 * @param ctx - plugin context (for the sessionPersistence service).
 * @returns the sessions root directory, or undefined when it cannot be determined.
 */
function resolveSessionsRoots(ctx) {
  const roots = []
  const add = (value) => {
    if (typeof value !== "string" || !value) return
    const resolved = resolve(value)
    if (!roots.includes(resolved)) roots.push(resolved)
  }

  // 1) The backend's own configured root — authoritative, because it is what
  //    actually writes the logs. Present on the shipped JSONL backend.
  add(ctx?.sessionPersistence?.root)
  add(ctx?.sessionPersistence?.config?.root)

  // 2) DSH_HOME, when this process happens to have it (CLI/tool children do).
  if (process.env.DSH_HOME) add(resolve(process.env.DSH_HOME, "sessions"))

  // 3) Recover from argv. The desktop host is launched with the dsh root and the
  //    profile directory as positional arguments, e.g.
  //      ... dsh-desktop-host/lib/index.js <dshRoot> <profileDir> ...
  for (const arg of process.argv ?? []) {
    if (typeof arg !== "string" || !arg) continue
    const resolved = resolve(arg)
    if (basename(resolved) === "sessions") { add(resolved); continue }
    add(resolve(resolved, "sessions"))
    add(resolve(resolved, "..", "sessions"))
    add(resolve(resolved, "..", "..", "sessions"))
  }

  // Only keep roots that actually exist and look like a sessions store.
  return roots.filter((root) => {
    try { return statSync(root).isDirectory() } catch { return false }
  })
}

/** Whether a resolved session directory is covered by one of the known roots. */
function isUnderSessionsRoot(roots, sessionDir) {
  for (const root of roots) {
    const fromRoot = relative(root, sessionDir)
    if (fromRoot && fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot)) return true
  }
  return false
}

/** A session directory is recognizable when it holds a session log artifact. */
function looksLikeSessionDirectory(sessionDir) {
  try {
    return readdirSync(sessionDir).some((name) => /^session.*\.jsonl(\.zstd)?$/.test(name))
  } catch {
    return false
  }
}

/**
 * Find a session's own directory by scanning the sessions root for a project
 * group containing a directory named exactly `sessionId`.
 *
 * Why this exists: `sessionPersistence.locate(header)` builds the path from
 * `header.cwd`. A header that carries no cwd, or whose project group was
 * renamed/moved while the session directory itself stayed put, therefore yields
 * no path at all — and the delete refuses with "does not use deletable JSONL
 * persistence" even though the artifact is sitting on disk. The session id is
 * the authoritative key (the kernel's own encodeSegment/sessionDir layout puts
 * one directory per id under a project group), so resolve it by id.
 *
 * @param sessionId - the session whose directory to locate.
 * @returns the absolute session directory path, or undefined when not found.
 */
function findSessionDirectory(ctx, sessionId) {
  for (const sessionsRoot of resolveSessionsRoots(ctx)) {
    let projects
    try { projects = readdirSync(sessionsRoot, { withFileTypes: true }) } catch { continue }
    for (const project of projects) {
      if (!project.isDirectory()) continue
      const candidate = resolve(sessionsRoot, project.name, sessionId)
      const fromRoot = relative(sessionsRoot, candidate)
      if (!fromRoot || fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) continue
      if (basename(candidate) !== sessionId) continue
      if (!looksLikeSessionDirectory(candidate)) continue
      return candidate
    }
  }
  return undefined
}

function safeSessionDirectory(ctx, location, sessionId) {
  const sessionDir = resolve(dirname(location.path))
  if (basename(sessionDir) !== sessionId) {
    throw new Error(`refusing unsafe session directory: ${sessionDir}`)
  }
  const roots = resolveSessionsRoots(ctx)
  if (!roots.length) throw new Error("DSH_HOME is unavailable")
  if (!isUnderSessionsRoot(roots, sessionDir)) {
    throw new Error(`refusing unsafe session directory: ${sessionDir}`)
  }
  return sessionDir
}

async function archiveForTransition(ctx, sessionId) {
  try {
    await ctx.workspaceRegistry.archiveSession(sessionId)
    return
  } catch (error) {
    const state = ctx.storageDomain.get("workspace")?.global?.get?.()
    if (!state || state.archivedSessionIds.includes(sessionId)) throw error
    const next = { ...state, archivedSessionIds: [...state.archivedSessionIds, sessionId] }
    if (typeof ctx.workspaceRegistry.setState === "function") await ctx.workspaceRegistry.setState(next)
    else {
      await ctx.storageDomain.get("workspace").global.set(next)
      if ("state" in ctx.workspaceRegistry) ctx.workspaceRegistry.state = next
    }
  }
}

async function removeAndVerify(sessionDir) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await rm(sessionDir, { recursive: true, force: true })
    await new Promise((resolve) => setImmediate(resolve))
  }
  if (existsSync(sessionDir)) throw new Error(`session directory still exists: ${sessionDir}`)
}

async function deleteSession(ctx, sessionId) {
  // [PATCH] sessionPersistence.list() 返回的是 snapshot（{ header, revision, sizeBytes }），
  // 不是 header 本身。原实现按 item.id 匹配，而 snapshot 上没有 id → 恒为 undefined，
  // 于是每次都抛 "session not found" → 路由 500；客户端又不检查状态码且吞掉异常，
  // 结果就是「删除会话」点完完全没反应。
  // [PATCH] list() 会**抛错**（例如同一个 id 出现在两个项目目录、或某条无关日志
  // 解不开），一抛就绕过下面的 stat 兜底，直接变成 delete-failed。
  // 这里把它降级为「尽力而为」：列举失败不再阻断单会话删除。
  let snapshots = []
  try { snapshots = await ctx.sessionPersistence.list() } catch (error) {
    ctx.logger?.warn?.("[dsh-session-context-menu] session list failed; falling back to per-session stat:", error)
  }
  const snapshot = snapshots.find((item) => item?.header?.id === sessionId || item?.id === sessionId)
  let header = snapshot?.header ?? snapshot
  // [PATCH] list() only surfaces sessions whose artifact it can decode, and a
  // single unreadable/unsupported log elsewhere in the store can make the whole
  // listing throw or omit entries. Fall back to stat(sessionId), which resolves
  // one session directly, so deleting session A never depends on the health of
  // unrelated session B. stat() also works for this process's created-but-not-
  // yet-materialized sessions, which list() reports only after materialization.
  if (!header && typeof ctx.sessionPersistence.stat === "function") {
    const stored = await ctx.sessionPersistence.stat(sessionId)
    header = stored?.header ?? stored
  }
  if (!header) throw new Error("session not found")
  if (header.id === undefined) header = { ...header, id: sessionId }
  if (header.origin === "subagent") throw new Error("subagent session cannot be deleted directly")
  let location
  try { location = ctx.sessionPersistence.locate(header) } catch { location = undefined }
  // [PATCH] locate() derives the path from header.cwd, so a header whose cwd is
  // absent (or whose group directory was renamed) yields no usable path and the
  // delete would refuse even though the artifact is plainly on disk. Fall back
  // to locating the session's own directory by id under DSH_HOME/sessions.
  if (location?.kind !== "jsonl" || typeof location.path !== "string") {
    const found = findSessionDirectory(ctx, sessionId)
    if (!found) throw new Error("session does not use deletable JSONL persistence")
    location = { kind: "jsonl", path: found }
  }
  const sessionDir = safeSessionDirectory(ctx, location, sessionId)
  await stopAgent(ctx.agents?.get?.(sessionId))
  const detached = await detachLiveSession(ctx, sessionId)

  await removeAndVerify(sessionDir)
  const warnings = []
  try { await removeProjection(ctx, sessionId) } catch (error) {
    warnings.push("projection-cleanup-failed")
    ctx.logger.warn(`[dsh-session-context-menu] failed to clean projection ${sessionId}:`, error)
  }
  await removeAndVerify(sessionDir)

  // Preserve the official UI transition only after durable deletion succeeds:
  // another selected session stays open; deleting the current one clears into
  // the default New Session view.
  try { await archiveForTransition(ctx, sessionId) } catch (error) {
    warnings.push("archive-transition-failed")
    ctx.logger.warn(`[dsh-session-context-menu] failed to transition deleted session ${sessionId}:`, error)
  }
  try { await removeWorkspaceAccounting(ctx, sessionId) } catch (error) {
    warnings.push("workspace-cleanup-failed")
    ctx.logger.warn(`[dsh-session-context-menu] failed to clean workspace accounting ${sessionId}:`, error)
  }

  return { ok: true, removed: true, detached, warnings }
}

/** Map an internal delete failure onto a stable code the client half can localize. */
function deleteErrorCode(error) {
  switch (String(error?.message || "")) {
    case "session not found": return "session-not-found"
    case "subagent session cannot be deleted directly": return "subagent-session"
    case "session does not use deletable JSONL persistence": return "session-files-not-found"
    case "DSH_HOME is unavailable": return "dsh-home-unavailable"
    default: return "delete-failed"
  }
}

export function apply(ctx) {
  let mutationTail = Promise.resolve()
  const withMutationLock = (operation) => {
    const result = mutationTail.then(operation, operation)
    mutationTail = result.then(() => undefined, () => undefined)
    return result
  }

  // [FIX 2026-09-30] 路由注册必须包在 ctx.effect 里，不能靠 apply() 的返回值回收。
  //
  // 根因（已在真实 cordis 上逐条复现）：
  //   cordis 执行插件回调时先做 `isConstructor(callback)` 判定 ——
  //   **只要函数带 `.prototype` 就走 `new callback(ctx, config)`**（cordis lib/index.js:1065）：
  //
  //     execute: function() {
  //       if (isConstructor(runtime.callback)) {
  //         const instance = new runtime.callback(this.ctx, this.config);
  //         for (const hook of instance?.[symbols.initHooks] ?? []) hook();
  //         return instance?.[symbols.init]?.();     // ← 返回值被丢弃，只取 init hook
  //       } else return runtime.callback(this.ctx, this.config);   // ← 返回值才会被当作 disposer
  //     }
  //
  //   `export function apply(ctx){}` 是**函数声明**，自带 `.prototype` ⇒ 被判为构造器 ⇒ 用 new 调用 ⇒
  //   `return () => {...}` 返回的清理函数**永远不会被登记**，dispose 时也不会被调用。
  //   （对比：对象字面量里的方法简写 `{ apply(ctx){} }` 没有 `.prototype`，返回值才会生效；
  //     本插件两种写法都出现过，正是这个差异把 bug 藏住了。）
  //
  // 实测对照（同一份 cordis，dispose 后打印日志）：
  //   `{ apply(ctx){ ...; return cleanup } }`          → cleanup 被调用 ✅
  //   `export function apply(ctx){ ...; return cleanup }` → cleanup **不被调用** ❌
  //   `export function apply(ctx){ ctx.effect(()=>cleanup) }` → cleanup 被调用 ✅
  //
  // 后果：`webServer.register()` 对重复的 (kind, path) **直接抛错**：
  //   `webserver: duplicate exact route "/dsh-session-context-menu/delete"`
  // 于是只要本 entry 被**重建**（HMR live reload、patchReload: live、profile 改 bundles），
  // 旧路由没被回收、第二次 apply 又注册同名路由 → 抛错 → Loader entry 拿不到 fiber → boot 审计报
  //   `@baihejiangnan/dsh-session-context-menu: import failed (see console for the import error)`
  // 这正是 2026-09-29/30 四次 web-boot 崩溃里「排第一、且不带错误细节」的那一条。
  //
  // 修法：用 ctx.effect 包住两条路由 —— ctx.effect 走 fiber 的 disposables 通道，
  //      与 apply 的调用形式（普通调用 / new 调用）无关，dispose 时必定执行。
  //      另加幂等兜底：万一旧路由仍在（例如上一版遗留、或宿主提供了 unregister），
  //      先注销再注册，绝不让整个 entry 因重复路由而挂掉。
  const deregister = (route) => {
    try { ctx.webServer?.unregister?.(route) } catch { /* 内核无 unregister 时忽略 */ }
  }

  const registerRoute = (kind, routePath, handler) => {
    // 兜底：先尝试注销可能残留的同名路由（幂等重挂载）。
    deregister({ kind, path: routePath })
    try {
      return ctx.webServer.register({ kind, path: routePath, handler })
    } catch (error) {
      if (!/duplicate .* route/i.test(String(error?.message ?? ""))) throw error
      // [PATCH] 宿主 webserver 没有 unregister（register 返回的 disposer 才是唯一
      // 回收通道，已由 ctx.effect 正确接管）。走到这里说明上一轮路由确实没被回收，
      // 而「保留旧路由」会让**旧闭包**继续服务：它捕获的是上一轮的 ctx 与 handler，
      // 于是一次热重载后删除请求会打到过期代码路径上，表现为「删不掉 / 报错永远是
      // 上一版行为」，且没有任何日志能看出来。改为显式诊断，不把重复注册伪装成成功。
      ctx.logger?.warn?.(
        `[dsh-session-context-menu] route ${routePath} is still registered by a previous load; ` +
        "the stale handler keeps serving this path. Reload/restart the harness to rebind it.",
      )
      return () => {}
    }
  }

  ctx.effect(() => {
    const disposeDeleteRoute = registerRoute("exact", DELETE_ROUTE, async (request, response) => {
      if (request.method !== "POST") return respond(response, 405, { ok: false, error: "method-not-allowed" })
      const validation = isSameOriginJsonRequest(request)
      if (!validation.ok) return respond(response, validation.status, { ok: false, error: validation.error })
      let body
      try { body = await readJsonBody(request) } catch { return respond(response, 400, { ok: false, error: "bad-request" }) }
      const sessionId = body?.sessionId
      if (typeof sessionId !== "string" || !SESSION_ID_RE.test(sessionId)) {
        return respond(response, 400, { ok: false, error: "invalid-session-id" })
      }
      return withMutationLock(async () => {
        try {
          respond(response, 200, await deleteSession(ctx, sessionId))
        } catch (error) {
          ctx.logger.warn(`[dsh-session-context-menu] failed to delete session ${sessionId}:`, error)
          respond(response, 500, { ok: false, error: deleteErrorCode(error) })
        }
      })
    })

    const disposeOpenUrlRoute = registerRoute("exact", OPEN_URL_ROUTE, async (request, response) => {
      if (request.method !== "POST") return respond(response, 405, { ok: false, error: "method-not-allowed" })
      const validation = isSameOriginJsonRequest(request)
      if (!validation.ok) return respond(response, validation.status, { ok: false, error: validation.error })
      let body
      try { body = await readJsonBody(request) } catch { return respond(response, 400, { ok: false, error: "bad-request" }) }
      const url = safeWebUrl(body?.url)
      if (!url) return respond(response, 400, { ok: false, error: "invalid-url" })
      try {
        await openUrl(url)
        respond(response, 200, { ok: true })
      } catch (error) {
        ctx.logger.warn(`[dsh-session-context-menu] failed to open URL ${url}:`, error)
        respond(response, 500, { ok: false, error: "open-url-failed" })
      }
    })

    return () => {
      disposeOpenUrlRoute?.()
      disposeDeleteRoute?.()
    }
  }, "dsh-session-context-menu: host routes")
}
