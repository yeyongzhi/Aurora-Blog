# HTML 面经
## HTML 语义化
使用合适的标签来标记不同的内容，让代码具有自解释性。例如：
- `header`：定义文档的头部区域
- `nav`：定义导航链接的部分
- `main`：定义文档的主要内容区域
- `article`：定义独立的文章或内容块
- `section`：定义文档中的节或章节
- `aside`：定义与主要内容相关的侧边栏内容
- `footer`：定义文档的底部区域
语义化的标签的价值有
1. 便于SEO搜索优化
2. 便于无障碍访问模式
3. 提升代码结构、可读性便于后期维护
4. 默认的网页支持，比如details自带的折叠功能、h1~h6的标题自带样式

## <!DOCTYPE html> 的作用是什么？
**<!DOCTYPE html>** 是 HTML 文档的第一行，用于声明文档类型为**HTML5**。它的作用是告诉浏览器使用 HTML5 解析器来渲染文档，触发标准模式 (Standards Mode)。
如果缺失，浏览器可能会进入怪异模式，可能会导致盒模型计算错误、布局错乱、css表现不一致等问题。

## meta 标签有哪些常见用途？
- 字符集：`<meta charset="UTF-8">` (防止乱码，必须放在 head 最前)。
- 视口设置：`<meta name="viewport" content="width=device-width, initial-scale=1.0">` (移动端适配核心)。
- SEO 控制：`description, keywords, robots` (控制爬虫索引)。
- HTTP 模拟：`http-equiv` (如刷新页面、设置` Content-Security-Policy`)。
- 移动端优化：`apple-mobile-web-app-capable` (全屏模式), `theme-color` (浏览器地址栏颜色)。

## <script> 标签中 defer 和 async 的区别？
**默认的情况（不添加任何属性）**下，script的加载会马上立即**下载**，下载完成之后会立即**执行**。这两个过程都会**阻塞HTML**的解析过程。
但是如果添加了`defer`或`async`属性，就会改变这个默认行为。它们都会**并行下载脚本，不阻塞HTML**的解析过程。
- **defer**：脚本会在页面解析完成后执行，按顺序执行。   
- **async**：脚本会在加载完成后立即执行，不按顺序执行（谁先下载完谁先执行）。

## 回流（Reflow）与重绘（Repaint）
**回流（Reflow）**和**重绘（Repaint）**是浏览器渲染页面时两个最关键的性能消耗点。理解它们的区别和触发机制，是前端性能优化的核心。
- **重绘（Repaint）**：重绘：只是“换衣服”（颜色、背景变了），不需要重新计算位置。
- **回流（Reflow）**：是“整容”或“搬家”（大小、位置、布局变了），需要重新计算整个或部分页面的几何结构，开销极大。

> 回流必然导致重绘，但重绘不一定导致回流

先简单了解一下浏览器渲染流程：
- DOM Tree：解析 HTML 生成。
- CSSOM Tree：解析 CSS 生成。
- Render Tree：DOM + CSSOM 合并，计算出每个节点的具体样式（排除 display: none 的节点）。
- Layout (回流)：计算每个节点在屏幕上的确切位置和大小。
- Paint (重绘)：将像素绘制到屏幕上。

触发重绘的几个条件：
1. 修改颜色 (color, background-color)
2. 修改可见性但不影响布局 (visibility: hidden，注意 display: none 会触发回流)
3. 修改边框样式 (border-style)
4. 添加/移除阴影 (box-shadow)
> 开销相对较小，但仍需 CPU 参与

触发回流的几个条件：
1. DOM 增删：添加或删除可见的 DOM 元素。
2. 位置变化：修改 top, left, margin, padding, border 等影响位置的属性。
3. 尺寸变化：修改 width, height。
4. 内容变化：修改文本内容、图片大小、输入框文字。
5. 窗口变化：浏览器窗口 resize (window.onresize)。
6. 字体加载：网页初始加载或动态改变字体大小。
7. 激活伪类：:hover 有时也会触发（取决于具体样式）。
8. JS 读取布局属性：这是最容易被忽视的！强制同步布局。

> 当你读取 `offsetTop`, `offsetLeft`, `scrollWidth`, `getComputedStyle()` 等属性时，浏览器为了保证返回值的准确性，会立即执行挂起的回流操作。
注意：现代浏览器会对<u>回流进行优化（批处理）</u>。它们会将多次修改放入队列，在**下一帧统一执行**。但如果你读取了布局属性（如 `offsetLeft`），就会**强制浏览器清空队列立即执行回流**，从而破坏优化。