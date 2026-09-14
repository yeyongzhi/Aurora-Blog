import { parseRoute, buildRoute } from './path'
import { FLAT_ROUTES } from '@/router/index'

/** 所有有效的页面 key（有对应组件的页面，排除纯菜单父级） */
const VALID_KEYS: Set<string> = new Set(FLAT_ROUTES.keys())

export { type RouteResult } from './path'
export function getRouteFromPath(pathname: string) {
    return parseRoute(pathname, import.meta.env.BASE_URL, VALID_KEYS)
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
    return buildRoute(key, articlePath, import.meta.env.BASE_URL)
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
