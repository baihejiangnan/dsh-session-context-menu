window.__ModuleLoader__.load({
  id: "@baihejiangnan/dsh-session-context-menu",
  factory: () => {
    const module = { exports: {} }
    const KEY = Symbol.for("dsh.session-context-menu.extensions")
    const LEASE = Symbol.for("dsh.session-context-menu.lease")
    const CSS = `.dshcm-menu{position:fixed;z-index:2147483647;width:max-content;min-width:148px;max-width:260px;padding:4px;background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#161616);border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:7px;box-shadow:0 5px 16px #00000029;font:13px/18px system-ui,sans-serif}.dshcm-item{box-sizing:border-box;width:100%;height:30px;padding:0 8px;text-align:left;white-space:nowrap;color:inherit;background:transparent;border:0;border-radius:5px;cursor:pointer;display:flex;gap:16px;align-items:center;justify-content:space-between}.dshcm-item:hover,.dshcm-item:focus-visible{background:var(--dsw-alias-interactive-bg-hover,#0000000f);outline:none}.dshcm-item--danger{color:var(--dsw-alias-state-error-primary,#d93025)}.dshcm-shortcut{color:var(--dsw-alias-label-tertiary,#777);font-size:11px}.dshcm-separator{height:1px;margin:4px -4px;background:var(--dsw-alias-border-l2,#ddd)}.dshcm-toast{position:fixed;z-index:2147483647;left:50%;bottom:28px;transform:translateX(-50%);padding:7px 12px;border-radius:7px;background:#222;color:#fff;font:13px/18px system-ui,sans-serif;box-shadow:0 6px 20px #0003}.dshcm-dialog-backdrop{position:fixed;z-index:2147483647;inset:0;display:grid;place-items:center;padding:20px;background:#0006}.dshcm-dialog{box-sizing:border-box;width:min(420px,100%);padding:20px;background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#161616);border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:12px;box-shadow:0 18px 50px #0005;font:14px/21px system-ui,sans-serif}.dshcm-dialog-title{margin:0 0 10px;font-size:17px;line-height:24px;font-weight:650}.dshcm-dialog-message{margin:0;white-space:pre-line;color:var(--dsw-alias-label-secondary,#555)}.dshcm-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:22px}.dshcm-dialog-button{min-width:72px;height:34px;padding:0 14px;border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:7px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;cursor:pointer;font:inherit}.dshcm-dialog-button:hover,.dshcm-dialog-button:focus-visible{background:var(--dsw-alias-interactive-bg-hover,#0000000f);outline:2px solid var(--dsw-alias-state-focus,#6b9eff);outline-offset:1px}.dshcm-dialog-confirm{border-color:transparent;background:var(--dsw-alias-state-error-primary,#d93025);color:#fff}.dshcm-dialog-confirm:hover,.dshcm-dialog-confirm:focus-visible{background:var(--dsw-alias-state-error-primary,#c5221f)}`
    const MESSAGES = {
      zh: {
        renameSession: "重命名会话", archiveSession: "归档会话", deleteSession: "删除会话", openInExplorer: "在资源管理器中打开",
        copyWorkingDirectory: "复制工作目录", copySessionId: "复制会话 ID", forkSession: "创建会话分支",
        refresh: "刷新", newSession: "新建会话", renameWorkspace: "重命名工作区",
        copyWorkspacePath: "复制工作区路径", archiveWorkspaceSessions: "归档工作区会话", removeWorkspace: "移除工作区",
        undo: "撤销", redo: "重做", cut: "剪切", copy: "复制", paste: "粘贴", selectAll: "全选",
        copySelectedText: "复制所选文本", openInDefaultBrowser: "使用默认浏览器打开", copyLink: "复制链接",
        selectCurrentContent: "全选当前内容", copiedWorkingDirectory: "已复制工作目录", copiedSessionId: "已复制会话 ID",
        copiedWorkspacePath: "已复制工作区路径", sessionRenamed: "会话已重命名", sessionArchived: "会话已归档",
        workspaceRemoved: "已移除工作区", copied: "已复制", cutDone: "已剪切", linkCopied: "已复制链接",
        noWorkspaceSessions: "该工作区没有可归档的会话", archiveWorkspaceConfirm: "归档“{title}”中的 {count} 个会话？",
        workspaceSessionsArchived: "已归档 {count} 个会话", removeWorkspaceConfirm: "从 Harness 中移除工作区“{title}”？\n\n目录、文件和会话日志不会被删除。",
        officialSessionActionUnavailable: "当前会话尚未提供该官方操作", officialWorkspaceActionUnavailable: "找不到官方工作区操作",
        openFailed: "打开失败: {reason}", unknownError: "未知错误", clipboardUnavailable: "剪贴板不可用",
        clipboardReadFailed: "无法读取剪贴板，请使用 Ctrl+V", useUndoShortcut: "请使用 Ctrl+Z 撤销", useRedoShortcut: "请使用 Ctrl+Y 重做", invalidLink: "链接地址无效",
        officialRenameUnavailable: "无法打开官方重命名窗口", officialWorkspaceRenameUnavailable: "无法打开官方工作区重命名窗口",
        officialArchiveUnavailable: "无法调用官方归档会话", officialForkUnavailable: "无法调用官方分叉会话",
        sessionUnknown: "无法确定当前会话", sessionNameEmpty: "会话名称不能为空", sessionServiceUnavailable: "无法取得官方会话服务",
        renameFailed: "重命名失败", editPositionUnknown: "无法确定编辑位置", deleteSessionDialogTitle: "永久删除会话？", deleteSessionConfirm: "会话“{title}”的记录及其硬盘文件将被删除。\n\n此操作不可恢复。",
        confirmDelete: "确定删除", cancel: "取消",
        sessionDeleted: "会话已永久删除", sessionRunning: "会话仍在运行，无法删除", subagentSession: "子代理会话不能直接删除",
        sessionNotFound: "找不到该会话", sessionFilesNotFound: "找不到该会话的本地文件", deleteFailed: "删除会话失败",
      },
      en: {
        renameSession: "Rename session", archiveSession: "Archive session", deleteSession: "Delete session", openInExplorer: "Open in File Explorer",
        copyWorkingDirectory: "Copy working directory", copySessionId: "Copy session ID", forkSession: "Fork session",
        refresh: "Refresh", newSession: "New session", renameWorkspace: "Rename workspace",
        copyWorkspacePath: "Copy workspace path", archiveWorkspaceSessions: "Archive workspace sessions", removeWorkspace: "Remove workspace",
        undo: "Undo", redo: "Redo", cut: "Cut", copy: "Copy", paste: "Paste", selectAll: "Select all",
        copySelectedText: "Copy selected text", openInDefaultBrowser: "Open in default browser", copyLink: "Copy link",
        selectCurrentContent: "Select current content", copiedWorkingDirectory: "Working directory copied", copiedSessionId: "Session ID copied",
        copiedWorkspacePath: "Workspace path copied", sessionRenamed: "Session renamed", sessionArchived: "Session archived",
        workspaceRemoved: "Workspace removed", copied: "Copied", cutDone: "Cut", linkCopied: "Link copied",
        noWorkspaceSessions: "This workspace has no sessions to archive", archiveWorkspaceConfirm: "Archive {count} sessions in “{title}”?",
        workspaceSessionsArchived: "Archived {count} sessions", removeWorkspaceConfirm: "Remove workspace “{title}” from Harness?\n\nIts directory, files, and session logs will not be deleted.",
        officialSessionActionUnavailable: "The official action is not available for this session", officialWorkspaceActionUnavailable: "Official workspace actions could not be found",
        openFailed: "Failed to open: {reason}", unknownError: "Unknown error", clipboardUnavailable: "Clipboard is unavailable",
        clipboardReadFailed: "Could not read the clipboard; use Ctrl+V", useUndoShortcut: "Use Ctrl+Z to undo", useRedoShortcut: "Use Ctrl+Y to redo", invalidLink: "Invalid link URL",
        officialRenameUnavailable: "Could not open the official rename dialog", officialWorkspaceRenameUnavailable: "Could not open the official workspace rename dialog",
        officialArchiveUnavailable: "Could not invoke the official archive action", officialForkUnavailable: "Could not invoke the official fork action",
        sessionUnknown: "Could not determine the current session", sessionNameEmpty: "Session name cannot be empty", sessionServiceUnavailable: "Official session service is unavailable",
        renameFailed: "Rename failed", editPositionUnknown: "Could not determine the editing position", deleteSessionDialogTitle: "Permanently delete session?", deleteSessionConfirm: "The record and files on disk for session “{title}” will be deleted.\n\nThis cannot be undone.",
        confirmDelete: "Delete", cancel: "Cancel",
        sessionDeleted: "Session permanently deleted", sessionRunning: "The session is still running and cannot be deleted", subagentSession: "Subagent sessions cannot be deleted directly",
        sessionNotFound: "Session not found", sessionFilesNotFound: "The session's local files could not be found", deleteFailed: "Failed to delete session",
      },
    }

    function locale() {
      const language = document.documentElement.lang || document.body?.getAttribute("lang") || ""
      if (language) return language.toLocaleLowerCase().startsWith("zh") ? "zh" : "en"
      const labels = [...document.querySelectorAll('button[aria-label]')].map((node) => node.getAttribute("aria-label") || "")
      if (labels.some((label) => /会话|工作区/.test(label))) return "zh"
      if (labels.some((label) => /session|workspace/i.test(label))) return "en"
      return (navigator.language || "").toLocaleLowerCase().startsWith("zh") ? "zh" : "en"
    }

    function t(key, values = {}) {
      return (MESSAGES[locale()][key] || MESSAGES.en[key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "")
    }

    function registry() {
      if (!globalThis[KEY]) {
        const entries = new Map()
        let leases = 0
        const api = {
          register(entry) {
            if (!entry?.id || entries.has(entry.id)) throw new Error("invalid or duplicate context-menu extension")
            entries.set(entry.id, entry)
            return () => {
              entries.delete(entry.id)
              if (!leases && !entries.size && globalThis[KEY] === api) delete globalThis[KEY]
            }
          },
          list: () => [...entries.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
          [LEASE](delta) {
            leases += delta
            if (!leases && !entries.size && globalThis[KEY] === api) delete globalThis[KEY]
          },
        }
        globalThis[KEY] = Object.freeze(api)
      }
      return globalThis[KEY]
    }

    function isAction(button) {
      const label = (button.getAttribute("aria-label") || "").toLocaleLowerCase()
      return (label.includes("会话") && label.includes("操作")) || (label.includes("session") && label.includes("action"))
    }

    function isWorkspaceAction(button) {
      const label = (button.getAttribute("aria-label") || "").toLocaleLowerCase()
      return (label.includes("工作区") && label.includes("操作")) || (label.includes("workspace") && label.includes("action"))
    }

    function rowFrom(target) {
      const row = target instanceof Element ? target.closest('[role="treeitem"]') : null
      if (!row) return null
      if (row.hasAttribute("aria-selected")) return row
      return [...row.querySelectorAll('button[aria-label]')].some(isAction) ? row : null
    }

    function treeItemWorkspace(row, items) {
      if (!row) return null
      const matches = items.filter((workspace) => {
        if ([row.getAttribute("aria-label"), row.getAttribute("title")].some((value) => value?.trim() === workspace.title)) return true
        return [...row.querySelectorAll("span,button,div")].some((node) =>
          node.closest('[role="treeitem"]') === row &&
          node.children.length === 0 &&
          node.textContent?.trim() === workspace.title,
        )
      })
      return matches.length === 1 ? matches[0] : null
    }

    function workspaceFrom(target, workspaces) {
      const targetRow = target instanceof Element ? target.closest('[role="treeitem"]') : null
      if (!targetRow) return null
      const items = workspaces.list.getSnapshot().items
      for (let row = targetRow; row; row = row.parentElement?.closest('[role="treeitem"]')) {
        const workspace = treeItemWorkspace(row, items)
        if (workspace) return { workspace, row, targetRow }
      }

      const rows = [...document.querySelectorAll('[role="treeitem"]')]
      const level = Number(targetRow.getAttribute("aria-level"))
      for (let index = rows.indexOf(targetRow) - 1; index >= 0; index -= 1) {
        const candidate = rows[index]
        const candidateLevel = Number(candidate.getAttribute("aria-level"))
        if (Number.isFinite(level) && Number.isFinite(candidateLevel) && candidateLevel >= level) continue
        if (rowFrom(candidate)) continue
        const workspace = treeItemWorkspace(candidate, items)
        if (workspace) return { workspace, row: candidate, targetRow }
        if (Number.isFinite(level) && Number.isFinite(candidateLevel) && candidateLevel < level) break
      }
      return null
    }

    function officialAction(row) {
      const direct = [...row.querySelectorAll('button[aria-label]')].find(isAction)
      if (direct) return direct
      const title = [...row.querySelectorAll("span")].find((node) => node.children.length === 0 && node.textContent?.trim())?.textContent?.trim()
      return [...document.querySelectorAll('button[aria-label]')].find((button) => {
        if (!isAction(button)) return false
        return !title || (button.getAttribute("aria-label") || "").includes(title)
      })
    }

    async function officialSelect(row, labels, failureMessage) {
      let action = officialAction(row)
      if (!action) {
        row.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: row.getBoundingClientRect().left + 8, clientY: row.getBoundingClientRect().top + 8 }))
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        action = officialAction(row)
      }
      if (!action) throw new Error(t("officialSessionActionUnavailable"))
      action.click()
      setTimeout(() => {
        const item = [...document.querySelectorAll('[role="menuitem"]')].find((node) =>
          labels.some((label) => label.test(node.textContent?.trim() || "")),
        )
        if (!item) {
          toast(failureMessage)
          return
        }
        item.click()
      }, 0)
    }

    function officialWorkspaceSelect(row, labels, failureMessage) {
      const action = [...row.querySelectorAll('button[aria-label]')].find(isWorkspaceAction)
      if (!action) throw new Error(t("officialWorkspaceActionUnavailable"))
      action.click()
      setTimeout(() => {
        const item = [...document.querySelectorAll('[role="menuitem"]')].find((node) =>
          labels.some((label) => label.test(node.textContent?.trim() || "")),
        )
        if (!item) {
          toast(failureMessage)
          return
        }
        item.click()
      }, 0)
    }

    function titleFrom(row) {
      const label = [...row.querySelectorAll('button[aria-label]')].find(isAction)?.getAttribute("aria-label") || ""
      return label.match(/[“\"](.+?)[”\"]/)?.[1] || row.firstElementChild?.textContent?.trim() || ""
    }

    function resolveSession(sessions, row, workspace) {
      const state = sessions.list.getSnapshot()
      if (row.getAttribute("aria-selected") === "true" && state.current) {
        return state.byId[state.current] || null
      }
      const title = titleFrom(row)
      if (!title) return null
      const ids = workspace?.sessionIds || state.ids
      const matches = ids.map((id) => state.byId[id]).filter((item) =>
        item && (
          item.title === title ||
          item.displayTitle === title ||
          (item.blank && /^(新会话|new session)$/i.test(title))
        ),
      )
      return matches.length === 1 ? matches[0] : null
    }

    function toast(message) {
      document.querySelector(".dshcm-toast")?.remove()
      const node = document.createElement("div")
      node.className = "dshcm-toast"
      node.textContent = message
      document.body.appendChild(node)
      setTimeout(() => node.remove(), 1800)
    }

    function confirmDialog({ title, message, confirmLabel, cancelLabel }) {
      document.querySelector(".dshcm-dialog-backdrop")?.querySelector("[data-cancel]")?.click()
      return new Promise((resolve) => {
        const previousFocus = document.activeElement
        const backdrop = document.createElement("div")
        backdrop.className = "dshcm-dialog-backdrop"
        const dialog = document.createElement("div")
        dialog.className = "dshcm-dialog"
        dialog.setAttribute("role", "alertdialog")
        dialog.setAttribute("aria-modal", "true")
        dialog.setAttribute("aria-labelledby", "dshcm-dialog-title")
        dialog.setAttribute("aria-describedby", "dshcm-dialog-description")
        const heading = document.createElement("h2")
        heading.id = "dshcm-dialog-title"
        heading.className = "dshcm-dialog-title"
        heading.textContent = title
        const description = document.createElement("p")
        description.id = "dshcm-dialog-description"
        description.className = "dshcm-dialog-message"
        description.textContent = message
        const actions = document.createElement("div")
        actions.className = "dshcm-dialog-actions"
        const cancel = document.createElement("button")
        cancel.type = "button"
        cancel.className = "dshcm-dialog-button"
        cancel.dataset.cancel = ""
        cancel.textContent = cancelLabel
        const confirm = document.createElement("button")
        confirm.type = "button"
        confirm.className = "dshcm-dialog-button dshcm-dialog-confirm"
        confirm.textContent = confirmLabel
        actions.append(cancel, confirm)
        dialog.append(heading, description, actions)
        backdrop.appendChild(dialog)
        document.body.appendChild(backdrop)

        let settled = false
        const finish = (value) => {
          if (settled) return
          settled = true
          document.removeEventListener("keydown", onKeyDown, true)
          backdrop.remove()
          if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
          resolve(value)
        }
        const onKeyDown = (event) => {
          if (event.key === "Escape") { event.preventDefault(); finish(false) }
          if (event.key === "Tab") {
            event.preventDefault()
            const target = event.shiftKey
              ? (document.activeElement === cancel ? confirm : cancel)
              : (document.activeElement === confirm ? cancel : confirm)
            target.focus()
          }
        }
        cancel.onclick = () => finish(false)
        confirm.onclick = () => finish(true)
        backdrop.onpointerdown = (event) => { if (event.target === backdrop) finish(false) }
        document.addEventListener("keydown", onKeyDown, true)
        cancel.focus()
      })
    }

    /**
     * 在系统资源管理器中打开一个目录路径。
     *
     * 为什么不用 workspaces.openPath：
     * dsh-better-sidebar 会包装（wrap）宿主 workspaces.openPath，把路径一律交给
     * 侧边栏编辑器（openInSidebar）。文件没问题，但**目录**被当文件打开时会报
     * `xxx is a directory`。这里直接调用宿主 RPC `host.openPath`（HTTP 端点
     * /api/host.openPath），完全绕过客户端服务层与 better-sidebar 的劫持，
     * 目录交给系统默认文件管理器打开。URL 由 openExternalUrl 交给 WebView 的
     * 外部导航处理，不能传给只接受文件系统路径的 host.openPath。
     *
     * @param {string} path - 绝对目录路径。
     */
    async function openInExplorer(path) {
      const response = await fetch("/api/host.openPath", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "client-request",
          rpcId: crypto.randomUUID(),
          method: "host.openPath",
          payload: { path },
        }),
      })
      if (!response.ok) throw new Error(t("openFailed", { reason: `HTTP ${response.status}` }))
      const full = await response.json()
      if (!full.result?.ok) {
        throw new Error(t("openFailed", { reason: full.result?.error?.message || t("unknownError") }))
      }
    }

    function externalUrl(value) {
      try {
        const url = new URL(value)
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : null
      } catch {
        return null
      }
    }

    function openExternalUrl(value) {
      const url = externalUrl(value)
      if (!url) throw new Error(t("openFailed", { reason: t("invalidLink") }))
      const link = document.createElement("a")
      link.href = url
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      link.remove()
    }

    function legacyCopy(text) {
      const field = document.createElement("textarea")
      field.value = text
      field.setAttribute("readonly", "")
      field.style.cssText = "position:fixed;left:-9999px;top:0"
      document.body.appendChild(field)
      field.select()
      const copied = document.execCommand("copy")
      field.remove()
      if (!copied) throw new Error(t("clipboardUnavailable"))
    }

    async function writeClipboard(text) {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(text); return } catch {}
      }
      legacyCopy(text)
    }

    async function readClipboard() {
      if (navigator.clipboard?.readText) {
        try { return await navigator.clipboard.readText() } catch {}
      }
      throw new Error(t("clipboardReadFailed"))
    }

    async function copy(text, message) {
      await writeClipboard(text)
      toast(message)
    }

    function workspaceForSession(workspaces, session) {
      if (!session) return null
      return workspaces.list.getSnapshot().items.find((workspace) => workspace.sessionIds.includes(session.id)) || null
    }

    async function renameSession(sessions, row, session) {
      if (officialAction(row)) {
        await officialSelect(row, [/^重命名$/i, /^rename$/i], t("officialRenameUnavailable"))
        return
      }
      if (!session) throw new Error(t("sessionUnknown"))
      const title = globalThis.prompt(t("renameSession"), session.displayTitle || session.title || "")
      if (title === null || title.trim() === (session.title || session.displayTitle)) return
      if (!title.trim()) throw new Error(t("sessionNameEmpty"))
      const binding = sessions.binding(session.id)
      if (!binding) throw new Error(t("sessionServiceUnavailable"))
      const result = await binding.session.rename(title.trim())
      if (!result.ok) throw new Error(result.error?.message || t("renameFailed"))
      toast(t("sessionRenamed"))
    }

    async function archiveSession(workspaces, row, session) {
      if (officialAction(row)) {
        await officialSelect(row, [/^归档会话$/i, /^archive( session)?$/i], t("officialArchiveUnavailable"))
        return
      }
      if (!session) throw new Error(t("sessionUnknown"))
      await workspaces.archiveSession(session.id)
      toast(t("sessionArchived"))
    }

    async function deleteSession(session) {
      if (!session) throw new Error(t("sessionUnknown"))
      const title = session.displayTitle || session.title || session.id
      const confirmed = await confirmDialog({
        title: t("deleteSessionDialogTitle"),
        message: t("deleteSessionConfirm", { title }),
        confirmLabel: t("confirmDelete"),
        cancelLabel: t("cancel"),
      })
      if (!confirmed) return
      try {
        await fetch("/dsh-session-context-menu/delete", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId: session.id }),
        })
      } catch {}
    }

    async function forkSession(sessions, row, session) {
      if (officialAction(row)) {
        await officialSelect(row, [/^分叉会话$/i, /^fork( session)?$/i], t("officialForkUnavailable"))
        return
      }
      if (!session) throw new Error(t("sessionUnknown"))
      const childId = await sessions.fork({ sessionId: session.id, increaseTitle: true })
      sessions.open(childId)
    }

    async function archiveWorkspaceSessions(workspaces, workspace) {
      const archived = new Set(workspaces.list.getSnapshot().archivedSessionIds)
      const sessionIds = workspace.sessionIds.filter((id) => !archived.has(id))
      if (!sessionIds.length) { toast(t("noWorkspaceSessions")); return }
      if (!globalThis.confirm(t("archiveWorkspaceConfirm", { title: workspace.title, count: sessionIds.length }))) return
      for (const id of sessionIds) await workspaces.archiveSession(id)
      toast(t("workspaceSessionsArchived", { count: sessionIds.length }))
    }

    async function removeWorkspace(workspaces, workspace) {
      if (!globalThis.confirm(t("removeWorkspaceConfirm", { title: workspace.title }))) return
      await workspaces.delete(workspace.workspaceId)
      toast(t("workspaceRemoved"))
    }

    function apply(ctx) {
      const sessions = ctx.get("sessions")
      const workspaces = ctx.get("workspaces")
      const extensionsRegistry = registry()
      extensionsRegistry[LEASE]?.(1)
      const style = document.createElement("style")
      style.dataset.pluginCss = "@baihejiangnan/dsh-session-context-menu"
      style.textContent = CSS
      document.head.appendChild(style)
      let menu = null
      const close = () => { menu?.remove(); menu = null }

      const add = (root, label, run, shortcut = "", danger = false) => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "dshcm-item"
        if (danger) button.classList.add("dshcm-item--danger")
        button.setAttribute("role", "menuitem")
        button.tabIndex = -1
        const text = document.createElement("span")
        text.textContent = label
        button.appendChild(text)
        if (shortcut) {
          const hint = document.createElement("span")
          hint.className = "dshcm-shortcut"
          hint.textContent = shortcut
          button.appendChild(hint)
        }
        button.onclick = async () => {
          close()
          try { await run() } catch (error) { toast(error?.message || String(error)) }
        }
        root.appendChild(button)
      }
      const split = (root) => {
        if (!root.childElementCount || root.lastElementChild?.classList.contains("dshcm-separator")) return
        const node = document.createElement("div")
        node.className = "dshcm-separator"
        node.setAttribute("role", "separator")
        root.appendChild(node)
      }

      const editableFrom = (target) => target instanceof Element
        ? target.closest('input:not([type="button"]):not([type="submit"]),textarea,[contenteditable="true"]')
        : null

      const selectedText = (editable) => {
        if (editable instanceof HTMLInputElement || editable instanceof HTMLTextAreaElement) {
          return editable.value.slice(editable.selectionStart ?? 0, editable.selectionEnd ?? 0)
        }
        const selection = globalThis.getSelection()
        if (!selection) return ""
        if (editable && (!editable.contains(selection.anchorNode) || !editable.contains(selection.focusNode))) return ""
        return selection.toString()
      }

      const replaceSelection = (editable, value) => {
        editable.focus()
        if (editable instanceof HTMLInputElement || editable instanceof HTMLTextAreaElement) {
          const start = editable.selectionStart ?? editable.value.length
          const end = editable.selectionEnd ?? start
          editable.setRangeText(value, start, end, "end")
          editable.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }))
        } else {
          const selection = globalThis.getSelection()
          if (!selection?.rangeCount || !editable.contains(selection.anchorNode)) throw new Error(t("editPositionUnknown"))
          const range = selection.getRangeAt(0)
          range.deleteContents()
          const text = document.createTextNode(value)
          range.insertNode(text)
          range.setStartAfter(text)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
          editable.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }))
        }
      }

      const deleteSelection = (editable) => replaceSelection(editable, "")

      const selectAll = (editable) => {
        editable.focus()
        if (editable instanceof HTMLInputElement || editable instanceof HTMLTextAreaElement) editable.select()
        else selectSurface(editable)
      }

      const selectionSurface = (target) => {
        const conversation = target instanceof Element ? target.closest('[data-slot="conversation.session"]') : null
        if (conversation) return conversation
        const dialog = target instanceof Element ? target.closest('[role="dialog"]') : null
        if (dialog) return dialog
        const hero = target instanceof Element ? target.closest('[data-phase="hero"]') : null
        return hero?.querySelector(':scope > [data-conversation-scroll]') ? hero : null
      }

      const selectSurface = (surface) => {
        if (!surface) return
        const selection = globalThis.getSelection()
        if (!selection) return
        const range = document.createRange()
        range.selectNodeContents(surface)
        selection.removeAllRanges()
        selection.addRange(range)
      }

      const selectedUrl = (value) => {
        const text = value.trim()
        if (!/^https?:\/\/\S+$/i.test(text)) return null
        return externalUrl(text)
      }

      const position = (root, event) => {
        const rect = root.getBoundingClientRect()
        root.style.left = `${Math.max(6, Math.min(event.clientX, innerWidth - rect.width - 6))}px`
        root.style.top = `${Math.max(6, Math.min(event.clientY, innerHeight - rect.height - 6))}px`
        root.style.visibility = "visible"
        root.querySelector("button")?.focus()
      }

      const onContextMenu = (event) => {
        if (event.defaultPrevented) return
        const row = rowFrom(event.target)
        const domSessionWorkspace = row && workspaceFrom(event.target, workspaces)
        const session = row && resolveSession(sessions, row, domSessionWorkspace?.workspace)
        const resolvedWorkspace = domSessionWorkspace?.workspace || workspaceForSession(workspaces, session)
        const sessionWorkspace = resolvedWorkspace ? { workspace: resolvedWorkspace } : null
        const workspaceTarget = !row && workspaceFrom(event.target, workspaces)
        const editable = editableFrom(event.target)
        const selection = selectedText(editable).trim()
        const link = event.target instanceof Element ? event.target.closest("a[href]") : null
        const surface = selectionSurface(event.target)
        if (!row && !workspaceTarget && !editable && !selection && !link && !surface) return
        event.preventDefault()
        event.stopPropagation()
        close()
        const root = document.createElement("div")
        root.className = "dshcm-menu"
        root.setAttribute("role", "menu")
        root.style.visibility = "hidden"
        document.body.appendChild(root)
        menu = root

        const registeredExtensions = extensionsRegistry.list()
        globalThis.dispatchEvent(new CustomEvent("dsh:session-context-menu", {
          detail: {
            row: row || workspaceTarget?.targetRow || null,
            action: row ? officialAction(row) : null,
            session,
            workspace: workspaceTarget?.workspace || null,
            target: event.target,
            x: event.clientX,
            y: event.clientY,
            extensions: registeredExtensions,
          },
        }))

        if (row) {
          add(root, t("renameSession"), () => renameSession(sessions, row, session))
          add(root, t("archiveSession"), () => archiveSession(workspaces, row, session))
          add(root, t("deleteSession"), () => deleteSession(session), "", true)
          const cwd = session?.cwd || sessionWorkspace?.workspace.path
          if (cwd) {
            split(root)
            add(root, t("openInExplorer"), () => openInExplorer(cwd))
            add(root, t("copyWorkingDirectory"), () => copy(cwd, t("copiedWorkingDirectory")))
          }
          if (session) add(root, t("copySessionId"), () => copy(session.id, t("copiedSessionId")))

          split(root)
          add(root, t("forkSession"), () => forkSession(sessions, row, session))

          const extensions = session
            ? registeredExtensions.filter((entry) => entry.visible?.({ session, row }) !== false)
            : []
          if (extensions.length) {
            split(root)
            for (const entry of extensions) add(root, entry.label || entry.id, () => entry.run({ session, row, sessions, workspaces, close }))
          }
          split(root)
          add(root, t("refresh"), () => globalThis.location.reload(), "Ctrl+R")
        } else if (workspaceTarget) {
          const workspace = workspaceTarget.workspace
          add(root, t("newSession"), () => workspaces.startSession(workspace.workspaceId))
          add(root, t("openInExplorer"), () => openInExplorer(workspace.path))
          split(root)
          add(root, t("renameWorkspace"), () => officialWorkspaceSelect(
            workspaceTarget.row,
            [/^重命名$/i, /^rename$/i],
            t("officialWorkspaceRenameUnavailable"),
          ))
          add(root, t("copyWorkspacePath"), () => copy(workspace.path, t("copiedWorkspacePath")))
          split(root)
          add(root, t("archiveWorkspaceSessions"), () => archiveWorkspaceSessions(workspaces, workspace))
          add(root, t("removeWorkspace"), () => removeWorkspace(workspaces, workspace))
          split(root)
          add(root, t("refresh"), () => globalThis.location.reload(), "Ctrl+R")
        } else if (editable) {
          add(root, t("undo"), () => { editable.focus(); if (!document.execCommand("undo")) throw new Error(t("useUndoShortcut")) }, "Ctrl+Z")
          add(root, t("redo"), () => { editable.focus(); if (!document.execCommand("redo")) throw new Error(t("useRedoShortcut")) }, "Ctrl+Y")
          split(root)
          add(root, t("cut"), async () => { if (selection) await copy(selection, t("cutDone")); deleteSelection(editable) }, "Ctrl+X")
          add(root, t("copy"), () => copy(selection, t("copied")), "Ctrl+C")
          add(root, t("paste"), async () => replaceSelection(editable, await readClipboard()), "Ctrl+V")
          split(root)
          add(root, t("selectAll"), () => selectAll(editable), "Ctrl+A")
          split(root)
          add(root, t("refresh"), () => globalThis.location.reload(), "Ctrl+R")
        } else {
          if (selection) add(root, t("copySelectedText"), () => copy(selection, t("copied")), "Ctrl+C")
          const url = externalUrl(link?.href) || selectedUrl(selection)
          if (url) {
            if (selection) split(root)
            add(root, t("openInDefaultBrowser"), () => openExternalUrl(url))
            add(root, t("copyLink"), () => copy(url, t("linkCopied")))
          }
          if (surface) {
            if (selection || url) split(root)
            add(root, t("selectCurrentContent"), () => selectSurface(surface), "Ctrl+A")
          }
          split(root)
          add(root, t("refresh"), () => globalThis.location.reload(), "Ctrl+R")
        }
        position(root, event)
      }

      const outside = (event) => { if (menu && !menu.contains(event.target)) close() }
      const keyboard = (event) => {
        if (!menu) return
        if (event.key === "Escape") { close(); return }
        const items = [...menu.querySelectorAll('[role="menuitem"]')]
        const current = items.indexOf(document.activeElement)
        let next = null
        if (event.key === "ArrowDown") next = items[(current + 1 + items.length) % items.length]
        else if (event.key === "ArrowUp") next = items[(current - 1 + items.length) % items.length]
        else if (event.key === "Home") next = items[0]
        else if (event.key === "End") next = items.at(-1)
        if (next) { event.preventDefault(); next.focus() }
      }
      document.addEventListener("contextmenu", onContextMenu, true)
      document.addEventListener("pointerdown", outside, true)
      document.addEventListener("keydown", keyboard, true)
      let disposed = false
      return () => {
        if (disposed) return
        disposed = true
        close(); document.querySelector(".dshcm-dialog-backdrop")?.querySelector("[data-cancel]")?.click(); style.remove()
        document.removeEventListener("contextmenu", onContextMenu, true)
        document.removeEventListener("pointerdown", outside, true)
        document.removeEventListener("keydown", keyboard, true)
        if (extensionsRegistry[LEASE]) extensionsRegistry[LEASE](-1)
        else if (globalThis[KEY] === extensionsRegistry && !extensionsRegistry.list().length) delete globalThis[KEY]
      }
    }

    module.exports.apply = apply
    module.exports.inject = ["sessions", "workspaces"]
    module.exports.registry = registry
    return module.exports
  },
})
