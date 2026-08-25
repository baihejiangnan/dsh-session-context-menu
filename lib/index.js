import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path"

export const inject = ["webServer", "sessionPersistence", "workspaceRegistry", "agents", "sessions", "storageDomain"]

const DELETE_ROUTE = "/dsh-session-context-menu/delete"
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

function safeSessionDirectory(location, sessionId) {
  const dshHome = process.env.DSH_HOME
  if (!dshHome) throw new Error("DSH_HOME is unavailable")
  const sessionsRoot = resolve(dshHome, "sessions")
  const sessionDir = resolve(dirname(location.path))
  const fromRoot = relative(sessionsRoot, sessionDir)
  const outsideRoot = !fromRoot || fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)
  if (outsideRoot || basename(sessionDir) !== sessionId) {
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
  const header = (await ctx.sessionPersistence.list()).find((item) => item.id === sessionId)
  if (!header) throw new Error("session not found")
  if (header.origin === "subagent") throw new Error("subagent session cannot be deleted directly")
  const location = ctx.sessionPersistence.locate(header)
  if (location?.kind !== "jsonl" || typeof location.path !== "string") {
    throw new Error("session does not use deletable JSONL persistence")
  }
  const sessionDir = safeSessionDirectory(location, sessionId)
  await stopAgent(ctx.agents.get(sessionId))
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

export function apply(ctx) {
  let mutationTail = Promise.resolve()
  const withMutationLock = (operation) => {
    const result = mutationTail.then(operation, operation)
    mutationTail = result.then(() => undefined, () => undefined)
    return result
  }

  return ctx.webServer.register({
    kind: "exact",
    path: DELETE_ROUTE,
    handler: async (request, response) => {
      if (request.method !== "POST") return respond(response, 405, { ok: false, error: "method-not-allowed" })
      const contentType = request.headers?.["content-type"] || ""
      if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
        return respond(response, 415, { ok: false, error: "unsupported-media-type" })
      }
      const origin = request.headers?.origin
      const host = request.headers?.host
      if (origin && host) {
        let sameOrigin = false
        try { sameOrigin = new URL(origin).host === host } catch {}
        if (!sameOrigin) return respond(response, 403, { ok: false, error: "cross-origin-request" })
      }
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
          respond(response, 500, { ok: false, error: "delete-failed" })
        }
      })
    },
  })
}
