# DSH Session Context Menu

为 DeepSeek Harness 应用封装端增加鼠标右键菜单，覆盖会话、工作区、设置页、对话正文、链接与输入框。官方已有的会话操作转交官方组件，其余操作使用 Harness 服务、浏览器标准选择范围和 Clipboard API。

## 安装

要求已安装 DeepSeek Harness，并使用 Web Profile。推荐直接从 GitHub 安装稳定版本：

```bash
dsh plugin --profile web add github:baihejiangnan/dsh-session-context-menu
```

安装后重启 `dsh web` 或承载它的 Tauri、EAC 等应用封装端。开发者也可以克隆仓库后使用本地路径链接：

```bash
git clone https://github.com/baihejiangnan/dsh-session-context-menu.git
dsh plugin --profile web add ./dsh-session-context-menu
```

当前稳定版本为 `0.2.13`。

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

## GitHub Topics

本仓库使用 `dsh-plugin` Topic，发布为公开仓库后会由 GitHub 自动聚合到 [`github.com/topics/dsh-plugin`](https://github.com/topics/dsh-plugin)。同时使用 `deepseek-harness`、`context-menu`、`tauri` 和 `webview` 等 Topic 描述用途与运行环境。

## 为什么不提供“置顶会话”

Codex 的“置顶聊天”不是简单地把某一行移动到列表第一位，而是由独立的 pin 状态驱动：被置顶的会话固定显示在置顶分区，未置顶的会话仍然可以继续按照最近更新时间排序。两套规则彼此独立，因此新消息、会话更新和应用重启都不会取消置顶，也不会改变其他会话的时间排序方式。

DeepSeek Harness 当前公开的会话与工作区状态中没有对应的 `pinned` 字段、置顶集合、置顶 RPC 或状态变更事件。Harness 侧栏目前只提供两种整体排序方式：

- **最近更新**：所有会话统一按照活动时间调整顺序。即使插件通过 `workspaces.insertSessionBefore()` 把某个会话移动到工作区顺序顶部，侧栏仍会按照更新时间重新计算显示顺序。
- **手动排序**：可以把某个会话移动到顶部，但会让整个会话列表停止按更新时间自动排序。这与 Codex“固定置顶，同时让其他会话继续按时间排序”的行为不同。

因此，本插件不提供“置顶会话”，也不会用切换全局手动排序、直接修改 Harness 本地存储、重排 React DOM 或修改会话日志等方式模拟置顶。这些方案会改变用户原有的排序偏好，且在 Tauri、EAC、搜索结果和不同版本的 Harness 中容易失效，不能作为稳定功能发布。

如果 Harness 后续增加独立的 pin 状态和公开操作接口，本插件可以在不干扰普通会话时间排序的前提下接入真正的置顶功能。

## 0.2.5

- 修复非输入框选中文本右键时的空对象异常。
- 恢复会话、工作区、“新会话”、对话内容区和设置弹窗的菜单接管。
- 仅在能识别 Harness 目标时阻止宿主原生菜单，其他区域保持原行为。

## 0.2.6

- 会话行不再依赖悬停后才出现的三点操作按钮，改用 Harness 的 `treeitem` / `aria-selected` 语义识别。
- 同名会话或尚未生成标题的新会话无法唯一取得 ID 时，仍显示安全菜单，并使用所属工作区目录。

## 0.2.7

- 工作区右键菜单的“重命名工作区”转交 Harness 官方工作区菜单，使用官方重命名弹窗、校验和数据更新流程。

## 0.2.8

- 参考 Codex 会话菜单重新分组，并曾尝试通过 Harness 工作区顺序模拟置顶；后续确认该方案会被“最近更新”排序覆盖，并不是真正的独立置顶。
- Harness 当前没有未读状态和可寻址会话 URL，因此未加入“标为未读”“复制深度链接”和“在新窗口打开”等无效项目。

## 0.2.9

- 修复侧栏使用 `displayTitle` 而插件只比较持久化 `title`，导致完整会话菜单项目被隐藏的问题。
- 当前选中行优先使用 Harness 的当前会话 ID，其余候选限制在所属工作区内解析。

## 0.2.10

- 会话的官方重命名、归档和分支项目不再因操作按钮的瞬时渲染状态而隐藏。
- 点击官方操作时会在插件菜单关闭后等待侧栏恢复悬停，再重新定位并调用 Harness 官方按钮，兼容 Tauri 与 EAC 的渲染时序。
- 搜索结果或扁平会话行没有官方三点按钮时，改用 Harness 官方会话/工作区公开服务完成重命名、归档和分支；所属工作区通过会话 ID 反查。

## 0.2.11

- 接管尚未产生对话内容时的 Hero 空白区域右键菜单，避免应用封装端显示 Chromium/WebView 原生菜单。
- Hero 识别同时要求 Harness 的 `data-phase="hero"` 和直属会话滚动区，侧栏、顶栏与右侧面板仍不接管。

## 0.2.12

- 修正“置顶会话”的错误语义：Harness 没有独立的 pin 状态，原实现会被“最近更新”排序覆盖。
- 菜单改为“移到工作区顶部”，通过官方工作区顺序移动会话，同时把官方侧栏视图切换为手动排序并持久化；工作区和扁平列表都会在刷新后把目标会话放到顶部。

## 0.2.13

- 移除“置顶会话/移到工作区顶部”及其排序写入逻辑。Harness 没有 Codex 式独立 pin 状态，不再以切换全局手动排序模拟置顶。
- 其他会话继续遵循 Harness 自身的“最近更新”或用户选择的排序方式。

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
