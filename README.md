# 更好的右键

> Better Context Menu for DeepSeek Harness

> [!WARNING]
> **当前版本不适配原生 Web 端。** 本插件只面向承载 DeepSeek Harness Web UI 的应用封装端，包括 Tauri、EAC、Electron、WebView2、CEF、Qt WebEngine 等桌面客户端。直接在 Chrome、Edge、Firefox 等普通浏览器中打开 `dsh web` 不属于当前支持范围，浏览器原生右键行为也不作为本插件的兼容目标。

“更好的右键”为 DeepSeek Harness 应用封装端提供更完整、接近原生客户端的鼠标右键体验，覆盖会话、工作区、设置页、对话正文、链接与输入框。官方已有的会话操作转交官方组件，其余操作使用 Harness 服务、浏览器标准选择范围和 Clipboard API。

## 安装

要求已安装 DeepSeek Harness，并使用 Web Profile。推荐跟随 GitHub `main` 分支安装；`main` 只放已经确认稳定的版本，后续可以直接执行更新命令：

```bash
dsh plugin --profile web add github:baihejiangnan/dsh-session-context-menu
```

如果希望锁定到当前稳定版本，不自动跟随后续更新，可以安装 Git 标签：

```bash
dsh plugin --profile web add github:baihejiangnan/dsh-session-context-menu#v0.2.14
```

安装后重启 `dsh web` 或承载它的 Tauri、EAC 等应用封装端。开发者也可以克隆仓库后使用本地路径链接：

```bash
git clone https://github.com/baihejiangnan/dsh-session-context-menu.git
dsh plugin --profile web add ./dsh-session-context-menu
```

当前稳定版本为 `0.2.14`。

### 更新

通过未锁定的 GitHub 地址安装后，执行下面的命令获取 `main` 上的最新稳定版本：

```bash
dsh plugin --profile web up @baihejiangnan/dsh-session-context-menu
```

更新完成后重启 `dsh web` 或应用封装端。使用 `#v0.2.14` 等标签锁定安装的用户，需要先把依赖目标改成新的稳定标签，或重新执行对应新标签的安装命令。

### 卸载

```bash
dsh plugin --profile web remove @baihejiangnan/dsh-session-context-menu
```

## 效果展示

### 会话与工作区

<table>
  <tr>
    <td width="34%" align="center"><strong>会话右键菜单</strong></td>
    <td width="66%" align="center"><strong>工作区右键菜单</strong></td>
  </tr>
  <tr>
    <td><img src="docs/images/session-menu.png" alt="会话右键菜单" /></td>
    <td><img src="docs/images/workspace-menu.png" alt="工作区右键菜单" /></td>
  </tr>
</table>

### 对话输入区

<img src="docs/images/conversation-empty-menu.png" alt="空白对话输入区右键菜单" width="100%" />

### 输出内容与侧边编辑器

<table>
  <tr>
    <td width="58%" align="center"><strong>输出内容右键菜单</strong></td>
    <td width="42%" align="center"><strong>侧边编辑器右键菜单</strong></td>
  </tr>
  <tr>
    <td><img src="docs/images/conversation-selection-menu.png" alt="输出内容选中文本右键菜单" /></td>
    <td><img src="docs/images/sidebar-editor-menu.png" alt="侧边编辑器右键菜单" /></td>
  </tr>
</table>

### 设置界面

<img src="docs/images/settings-menu.png" alt="设置界面选中文本右键菜单" width="80%" />

## 内置上下文

- 会话：官方重命名、分叉、归档；打开目录、复制目录和会话 ID。
- 工作区及其“新会话”入口：新建会话、打开目录、重命名、复制路径、归档会话和安全移除工作区。
- 普通文本：复制所选文本；全选严格限定在当前对话内容 slot 或设置弹窗，不包含应用侧边栏。
- 链接或选中的网址：使用系统默认浏览器打开、复制链接。
- 输入框：撤销、重做、剪切、复制、粘贴、全选。
- 所有插件菜单：刷新当前 Harness 页面。

## 兼容策略

- 不修改 `@deepseek-ai/*`、Tauri 壳或其他社区插件。
- 通过会话行的无障碍语义定位目标，通过 `sessions` 和 `workspaces` 公开服务执行业务；无法确认目标时保留浏览器默认菜单。
- 不复制官方持久化或 RPC 实现，官方仍是会话数据和操作结果的唯一来源。
- 插件卸载后不留下补丁。
- **与 dsh-better-sidebar 共存**（v0.2.14+）：better-sidebar 会包装宿主的
  `workspaces.openPath` 把所有路径导向侧边栏编辑器。为避免目录被当文件打开
  （`xxx is a directory`），本插件"在资源管理器中打开"直接调用宿主 RPC
  `host.openPath`（`POST /api/host.openPath`），目录始终交给系统文件管理器；
  链接类操作仍走 `workspaces.openPath`，保留 better-sidebar 在侧边栏打开链接的行为。

## 更新日志

### v0.2.14（2026-08-18）

- **修复**：与 `dsh-better-sidebar` 共存时，右键菜单"在资源管理器中打开"目录报
  `xxx is a directory`。目录打开改走宿主 RPC `host.openPath`，绕过 better-sidebar
  对 `workspaces.openPath` 的包装；链接打开行为不变。

### v0.2.13

- 完整上下文菜单（会话 / 工作区 / 设置页 / 对话正文 / 链接 / 输入框）。

## GitHub Topics

本仓库使用 `dsh-plugin` Topic，发布为公开仓库后会由 GitHub 自动聚合到 [`github.com/topics/dsh-plugin`](https://github.com/topics/dsh-plugin)。同时使用 `deepseek-harness`、`context-menu`、`tauri` 和 `webview` 等 Topic 描述用途与运行环境。

## 为什么不提供“置顶会话”

Codex 的“置顶聊天”不是简单地把某一行移动到列表第一位，而是由独立的 pin 状态驱动：被置顶的会话固定显示在置顶分区，未置顶的会话仍然可以继续按照最近更新时间排序。两套规则彼此独立，因此新消息、会话更新和应用重启都不会取消置顶，也不会改变其他会话的时间排序方式。

DeepSeek Harness 当前公开的会话与工作区状态中没有对应的 `pinned` 字段、置顶集合、置顶 RPC 或状态变更事件。Harness 侧栏目前只提供两种整体排序方式：

- **最近更新**：所有会话统一按照活动时间调整顺序。即使插件通过 `workspaces.insertSessionBefore()` 把某个会话移动到工作区顺序顶部，侧栏仍会按照更新时间重新计算显示顺序。
- **手动排序**：可以把某个会话移动到顶部，但会让整个会话列表停止按更新时间自动排序。这与 Codex“固定置顶，同时让其他会话继续按时间排序”的行为不同。

因此，本插件不提供“置顶会话”，也不会用切换全局手动排序、直接修改 Harness 本地存储、重排 React DOM 或修改会话日志等方式模拟置顶。这些方案会改变用户原有的排序偏好，且在 Tauri、EAC、搜索结果和不同版本的 Harness 中容易失效，不能作为稳定功能发布。

如果 Harness 后续增加独立的 pin 状态和公开操作接口，本插件可以在不干扰普通会话时间排序的前提下接入真正的置顶功能。

## 扩展协议

其他 Web 插件可通过全局注册表登记扩展信息。`run` 会在点击菜单项时执行，`visible` 可按会话决定是否显示：

```js
const menu = globalThis[Symbol.for('dsh.session-context-menu.extensions')]
const dispose = menu.register({
  id: 'example.session-details',
  order: 100,
  label: '会话详情',
  visible: ({ session }) => Boolean(session),
  run: ({ session }) => console.log(session),
})
```

每次打开右键菜单还会派发 `dsh:session-context-menu` 事件，`detail` 包含 `row`、官方菜单 `action`、`session`、原始 `target`、鼠标坐标 `x/y` 和当前 `extensions`。扩展插件应在卸载时调用注册返回的 disposer。

## 兼容性说明

- 同名会话无法从公开 DOM 语义中唯一识别时，不接管该会话行的浏览器默认菜单，以免操作错误会话。
- Clipboard API 不可写时会回退到浏览器复制命令；宿主禁止读取剪贴板时会提示使用 `Ctrl+V`。
- 撤销和重做受宿主编辑器能力限制；宿主不支持菜单调用时会提示使用对应快捷键。
