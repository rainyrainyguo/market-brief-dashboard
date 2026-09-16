# Market Brief Dashboard

中文 AI、半导体、宏观与机器人简报归档。完整正文在静态 HTML 中，JavaScript 增强分类、搜索、日期导航。支持 GitHub Pages 项目路径及域名根路径。

## 构建

需要 Node.js 22，无第三方依赖：

```sh
npm run build
npm run dev
```

`data/issues.json` 是内容来源；`build.mjs` 生成 `dist/`。公开部署仅上传 `dist/`。

## GitHub Pages 发布

1. 在自己的 GitHub 账号下创建专用仓库，例如 `market-brief-dashboard`。GitHub Free 使用公开仓库发布。
2. 提交以下文件：`package.json`、`build.mjs`、`serve.mjs`、`data/`、`public/`、本 README 及 `.github/workflows/pages.yml`。不要上传原始附件、录屏、诊断截图或本地临时文件。
3. 仓库默认分支使用 `main`。
4. 在 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。
5. 在 Actions 手动运行 Publish Market Brief，或再次提交到 main 触发构建。工作流只发布 dist。
6. 查看部署结果中的真实 URL，并在未登录浏览器验证页面、日期和搜索功能。

工作流使用 GitHub 自带的部署授权，不需要个人访问令牌。网站可在 `https://<owner>.github.io/market-brief-dashboard/` 发布；实际地址以成功部署结果为准。

## 早晚内容更新

此工作流负责构建和发布，不会自行研究或生成新闻。完整流程是：研究最新新闻 → 更新 data/issues.json → 提交到 main → Pages 自动发布。

接入 ChatGPT 早晚任务前，先验证 GitHub 的读写权限和一次完整部署。保留原任务约 08:00、19:00 的 America/Los_Angeles 时区，不创建重复任务。网站与任务尚未接通时，不得宣称自动更新已经运行。

每次更新必须从仓库最新版本开始，保留历史记录；不得用旧备份覆盖新期次。以日期及 am/pm 构成稳定 issue id，重试时避免重复追加。

## 内容格式与标准

- issue：id、date、period、time、timezone、updatedAt、summary、cards。
- card：id、category、title、status、importance、body、whyImportant、investmentImpact、tags、sources；可选 updateNote、verificationNote、originalStatus。
- period 为 am/pm；category 为 macro/ai/semi/robot。日期与时间采用 America/Los_Angeles 的实际日期及夏令时偏移。
- 研究过去半天进展，与上一期去重；宏观主导时置于前面。
- 每条包含发生了什么、为什么重要、传导链/投资影响、事实状态、标签及真实来源链接。将分析与事实区分。
- 机器人没有实质进展时如实说明；跟踪入口不冒充新闻证据。
- 初始迁移数据含 2026-09-11 晚至 2026-09-14 晚的 7 期、36 卡；历史来源补录和重复背景处有注记，不应当作当前新闻。

发布后核对公开页面最新期次与仓库一致。失败时保留上一次可用部署，报告失败，不声称发布成功。
