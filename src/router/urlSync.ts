import { FLAT_ROUTES } from '@/router/index'

/** 所有有效的页面 key（有对应组件的页面，排除纯菜单父级） */
const VALID_KEYS: Set<string> = new Set(FLAT_ROUTES.keys())

export interface RouteResult {
    key: string
    articlePath: string
}

/**
 * 从完整路径名中提取页面 key 和文章路径。
 * 第一段 = 页面 key，后续 = 文章树路径。
 *
 * 示例：
 *   "/Aurora-Blog/note/AI/helloAgents/chapter1" → { key: "note", articlePath: "AI/helloAgents/chapter1" }
 *   "/Aurora-Blog/note" → { key: "note", articlePath: "" }
 *   "/Aurora-Blog/about" → { key: "about", articlePath: "" }
 *   "/Aurora-Blog/" → null
 */
export function getRouteFromPath(pathname: string): RouteResult | null {
    const base = import.meta.env.BASE_URL  // "/Aurora-Blog/" in prod, "/" in dev
    let relative = pathname

    if (base !== '/' && pathname.startsWith(base)) {
        relative = pathname.substring(base.length)
    }

    // 移除首尾斜杠
    relative = relative.replace(/^\/+|\/+$/g, '')
    if (!relative) return null  // 根路径

    // 找到第一个 / 作为 page key 和 article path 的分界
    const firstSlash = relative.indexOf('/')
    const key = firstSlash === -1 ? relative : relative.substring(0, firstSlash)

    if (!VALID_KEYS.has(key)) return null  // 未知页面

    const articlePath = firstSlash === -1
        ? ''
        : relative.substring(firstSlash + 1).replace(/\/+$/g, '')  // 去掉尾部斜杠

    return { key, articlePath }
}

/**
 * 从完整路径名中提取页面 key（向后兼容的包装函数）。
 * 如 "/Aurora-Blog/note" → "note"。
 */
export function getKeyFromPath(pathname: string): string | null {
    const route = getRouteFromPath(pathname)
    return route?.key ?? null
}

/**
 * 将页面 key 转换为完整 URL 路径（含 base 前缀）。
 * 支持可选的 articlePath 参数用于文章深层链接。
 *
 * 如: getPathFromKey("note") → "/Aurora-Blog/note"
 *     getPathFromKey("note", "AI/helloAgents/chapter1") → "/Aurora-Blog/note/AI/helloAgents/chapter1"
 */
export function getPathFromKey(key: string, articlePath?: string): string {
    const base = import.meta.env.BASE_URL  // e.g., "/Aurora-Blog/"
    if (articlePath) {
        return base + key + '/' + articlePath
    }
    return base + key
}

/**
 * 设置 URL 同步：注册 popstate 监听，浏览器前进/后退时回调 onNavigate。
 * 必须在 app 初始化时调用一次。
 * 返回清理函数。
 */
export function setupUrlSync(
    onNavigate: (key: string, articlePath: string) => void,
): () => void {
    const popstateHandler = () => {
        const route = getRouteFromPath(window.location.pathname)
        if (route) {
            onNavigate(route.key, route.articlePath)
        } else {
            // 未知路径 → 回退到默认页
            onNavigate('home', '')
        }
    }

    window.addEventListener('popstate', popstateHandler)

    return () => {
        window.removeEventListener('popstate', popstateHandler)
    }
}
