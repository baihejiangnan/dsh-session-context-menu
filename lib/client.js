window.__ModuleLoader__.load({
  id: "@baihejiangnan/dsh-session-context-menu",
  factory: () => {
    const module = { exports: {} }
    const KEY = Symbol.for("dsh.session-context-menu.extensions")
    const LEASE = Symbol.for("dsh.session-context-menu.lease")
    const CSS = `.dshcm-menu{position:fixed;z-index:2147483647;width:max-content;min-width:148px;max-width:260px;padding:4px;background:var(--dsw-alias-bg-layer-2,#fff);color:var(--dsw-alias-label-primary,#161616);border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:7px;box-shadow:0 5px 16px #00000029;font:13px/18px system-ui,sans-serif}.dshcm-item{box-sizing:border-box;width:100%;height:30px;padding:0 8px;text-align:left;white-space:nowrap;color:inherit;background:transparent;border:0;border-radius:5px;cursor:pointer;display:flex;gap:16px;align-items:center;justify-content:space-between}.dshcm-item:hover,.dshcm-item:focus-visible{background:var(--dsw-alias-interactive-bg-hover,#0000000f);outline:none}.dshcm-shortcut{color:var(--dsw-alias-label-tertiary,#777);font-size:11px}.dshcm-separator{height:1px;margin:4px -4px;background:var(--dsw-alias-border-l2,#ddd)}.dshcm-toast{position:fixed;z-index:2147483647;left:50%;bottom:28px;transform:translateX(-50%);padding:7px 12px;border-radius:7px;background:#222;color:#fff;font:13px/18px system-ui,sans-serif;box-shadow:0 6px 20px #0003}`

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
      if (!action) throw new Error("当前会话尚未提供该官方操作")
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
      if (!action) throw new Error("找不到官方工作区操作")
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

    function legacyCopy(text) {
      const field = document.createElement("textarea")
      field.value = text
      field.setAttribute("readonly", "")
      field.style.cssText = "position:fixed;left:-9999px;top:0"
      document.body.appendChild(field)
      field.select()
      const copied = document.execCommand("copy")
      field.remove()
      if (!copied) throw new Error("剪贴板不可用")
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
      throw new Error("无法读取剪贴板，请使用 Ctrl+V")
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
        await officialSelect(row, [/^重命名$/i, /^rename$/i], "无法打开官方重命名窗口")
        return
      }
      if (!session) throw new Error("无法确定当前会话")
      const title = globalThis.prompt("重命名会话", session.displayTitle || session.title || "")
      if (title === null || title.trim() === (session.title || session.displayTitle)) return
      if (!title.trim()) throw new Error("会话名称不能为空")
      const binding = sessions.binding(session.id)
      if (!binding) throw new Error("无法取得官方会话服务")
      const result = await binding.session.rename(title.trim())
      if (!result.ok) throw new Error(result.error?.message || "重命名失败")
      toast("会话已重命名")
    }

    async function archiveSession(workspaces, row, session) {
      if (officialAction(row)) {
        await officialSelect(row, [/^归档会话$/i, /^archive( session)?$/i], "无法调用官方归档会话")
        return
      }
      if (!session) throw new Error("无法确定当前会话")
      await workspaces.archiveSession(session.id)
      toast("会话已归档")
    }

    async function forkSession(sessions, row, session) {
      if (officialAction(row)) {
        await officialSelect(row, [/^分叉会话$/i, /^fork( session)?$/i], "无法调用官方分叉会话")
        return
      }
      if (!session) throw new Error("无法确定当前会话")
      const childId = await sessions.fork({ sessionId: session.id, increaseTitle: true })
      sessions.open(childId)
    }

    async function archiveWorkspaceSessions(workspaces, workspace) {
      const archived = new Set(workspaces.list.getSnapshot().archivedSessionIds)
      const sessionIds = workspace.sessionIds.filter((id) => !archived.has(id))
      if (!sessionIds.length) { toast("该工作区没有可归档的会话"); return }
      if (!globalThis.confirm(`归档“${workspace.title}”中的 ${sessionIds.length} 个会话？`)) return
      for (const id of sessionIds) await workspaces.archiveSession(id)
      toast(`已归档 ${sessionIds.length} 个会话`)
    }

    async function removeWorkspace(workspaces, workspace) {
      if (!globalThis.confirm(`从 Harness 中移除工作区“${workspace.title}”？\n\n目录、文件和会话日志不会被删除。`)) return
      await workspaces.delete(workspace.workspaceId)
      toast("已移除工作区")
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

      const add = (root, label, run, shortcut = "") => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "dshcm-item"
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
          if (!selection?.rangeCount || !editable.contains(selection.anchorNode)) throw new Error("无法确定编辑位置")
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
        try { return new URL(text).href } catch { return null }
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
          add(root, "重命名会话", () => renameSession(sessions, row, session))
          add(root, "归档会话", () => archiveSession(workspaces, row, session))
          const cwd = session?.cwd || sessionWorkspace?.workspace.path
          if (cwd) {
            split(root)
            add(root, "在资源管理器中打开", () => workspaces.openPath(cwd))
            add(root, "复制工作目录", () => copy(cwd, "已复制工作目录"))
          }
          if (session) add(root, "复制会话 ID", () => copy(session.id, "已复制会话 ID"))

          split(root)
          add(root, "创建会话分支", () => forkSession(sessions, row, session))

          const extensions = session
            ? registeredExtensions.filter((entry) => entry.visible?.({ session, row }) !== false)
            : []
          if (extensions.length) {
            split(root)
            for (const entry of extensions) add(root, entry.label || entry.id, () => entry.run({ session, row, sessions, workspaces, close }))
          }
          split(root)
          add(root, "刷新", () => globalThis.location.reload(), "Ctrl+R")
        } else if (workspaceTarget) {
          const workspace = workspaceTarget.workspace
          add(root, "新建会话", () => workspaces.startSession(workspace.workspaceId))
          add(root, "在资源管理器中打开", () => workspaces.openPath(workspace.path))
          split(root)
          add(root, "重命名工作区", () => officialWorkspaceSelect(
            workspaceTarget.row,
            [/^重命名$/i, /^rename$/i],
            "无法打开官方工作区重命名窗口",
          ))
          add(root, "复制工作区路径", () => copy(workspace.path, "已复制工作区路径"))
          split(root)
          add(root, "归档工作区会话", () => archiveWorkspaceSessions(workspaces, workspace))
          add(root, "移除工作区", () => removeWorkspace(workspaces, workspace))
          split(root)
          add(root, "刷新", () => globalThis.location.reload(), "Ctrl+R")
        } else if (editable) {
          add(root, "撤销", () => { editable.focus(); if (!document.execCommand("undo")) throw new Error("请使用 Ctrl+Z 撤销") }, "Ctrl+Z")
          add(root, "重做", () => { editable.focus(); if (!document.execCommand("redo")) throw new Error("请使用 Ctrl+Y 重做") }, "Ctrl+Y")
          split(root)
          add(root, "剪切", async () => { if (selection) await copy(selection, "已剪切"); deleteSelection(editable) }, "Ctrl+X")
          add(root, "复制", () => copy(selection, "已复制"), "Ctrl+C")
          add(root, "粘贴", async () => replaceSelection(editable, await readClipboard()), "Ctrl+V")
          split(root)
          add(root, "全选", () => selectAll(editable), "Ctrl+A")
          split(root)
          add(root, "刷新", () => globalThis.location.reload(), "Ctrl+R")
        } else {
          if (selection) add(root, "复制所选文本", () => copy(selection, "已复制"), "Ctrl+C")
          const url = link?.href || selectedUrl(selection)
          if (url) {
            if (selection) split(root)
            add(root, "使用默认浏览器打开", () => workspaces.openPath(url))
            add(root, "复制链接", () => copy(url, "已复制链接"))
          }
          if (surface) {
            if (selection || url) split(root)
            add(root, "全选当前内容", () => selectSurface(surface), "Ctrl+A")
          }
          split(root)
          add(root, "刷新", () => globalThis.location.reload(), "Ctrl+R")
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
        close(); style.remove()
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
