# Aurora Blog

基于 Vue 3、TypeScript、Vite、Pinia、Tailwind CSS 和 shadcn-vue 的静态个人博客。
文章使用 Markdown 保存，目录与个人资料由 JSON 驱动，部署到 GitHub Pages。

## 本地开发

需要 Node.js 22.12 或更高版本，使用 package.json 指定的 pnpm 版本。

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

默认访问 `/Aurora-Blog/`。可选 `.env.local` 设置：

```dotenv
VITE_APP_SYSTEM_SETTING_KEY=aurora-system-settings
```

未设置时使用内置默认键。前端环境变量会发布到浏览器，不应填写密钥。

## 验证与构建

```sh
pnpm check
pnpm test
pnpm build
pnpm test:build
pnpm preview
```

`build` 先根据 Git 首次提交时间生成写作热力图，再进行类型检查、构建与文章静态页生成。
未提交的文章使用文件系统时间作为回退。CI 在 PR 中验证，在 main 推送或手动运行后部署 gh-pages。

## 内容维护

- 笔记：`public/note.json` → `public/article/note/`。
- 生活、思考、面试、代码：对应 `{分类}.json` 与 `public/article/{分类}/`。
- JSON 树节点需要字符串 `key`、`label`，可设置 `default: true`。同一分类内 key 必须唯一，不能包含斜杠或路径控制字符。
- 子节点路径按祖先 key 拼接，文章为同名 `.md` 文件。
- 图片路径相对文章目录，可使用 `![描述](images/example.png)`。
- 基于 markdown-it，支持标题、嵌套列表、待办、引用、表格、脚注、行内格式、链接、图片和反引号/波浪线代码围栏；代码块提供复制按钮。
- 自定义图片尺寸语法 `![描述](url)(宽, 高)` 保持兼容。
- 原始 HTML 默认转义，仅无属性 `<u>` 标签支持安全文本内容。

## 代码结构

- `src/views`：页面与业务组件。
- `src/components/ui`：shadcn-vue 基础组件。
- `src/components/self`：博客通用组件。
- `src/composables/useArticleCollection.ts`：共用目录加载、文章选择与 URL 同步。
- `src/utils/markdown.ts`：类型化 Markdown 解析与安全行内渲染。
- `src/router`：菜单配置与 History URL 同步。
- `tests`：文章解析、数据格式和请求容错回归验证。

正文使用系统字体以减少网络传输，原字体源文件保留在 `src/assets/font`，不参与构建。
图标组件使用显式映射，新增动态图标需要同时更新映射。

## 部署与后续验证

修改部署子路径时，同时更新 `vite.config.ts` 的 base 和 `public/404.html` 的 base。
404 页面通过重定向恢复深层链接。文章 DOM 会更新页面标题与描述；分享爬虫通常不执行 JavaScript，构建完成后会为已发布文章生成包含正文、标题、摘要和 Open Graph 信息的静态 HTML 页。设置 `SITE_URL`（含部署子路径及末尾斜杠）还会生成 canonical 与 sitemap，CI 默认使用 GitHub Pages 地址。

发布前检查：手机与桌面阅读布局、目录展开/收起、中文深层链接刷新、前进/后退、网络失败重试。
欢迎页第三方 API 依赖网络与服务可用性；失败时显示错误，并保留刷新入口。

## 发布、搜索与内容检查

目录节点可设置 `published: false` 保留未发布条目，阅读目录、全文搜索、静态页和 RSS 均不会发布它们。四个原有缺失条目已标记为未发布，补齐文件后删除该标记即可发布。

开发启动与构建自动生成标题和全文索引，搜索入口位于顶部。`pnpm check:content` 检查已发布文章、图片与站内链接，存在本地缺失会失败；完整报告见构建后的 `dist/content-report.json`。外部 URL 仅列出，不进行网络有效性判断。新增内容后重新启动开发服务或执行生成命令。

文章日期优先取 Git 首次提交和最近修改时间，无 Git 历史时回退到文件修改时间，阅读页会提示日期来源。此时间反映版本记录，不保证等于作者实际写作日期。CI 必须保留完整 Git 历史。

默认站点地址为 `https://yeyongzhi.github.io/Aurora-Blog/`，可通过含部署子路径的 `SITE_URL` 覆盖。构建生成 `rss.xml`、含 `lastmod` 的 sitemap，以及文章日期和 BlogPosting 元信息。RSS 提供最近更新的 50 篇文章摘要。阅读位置在本机 localStorage 中按文章保存，最多保留 100 篇；URL 中的章节定位优先于保存位置。未知文章路径显示明确提示。

图片直接加载原文件，不进行格式转换、压缩或缩放生成副本。
