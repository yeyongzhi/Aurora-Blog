export interface RouteResult { key: string; articlePath: string }
export function parseRoute(pathname: string, base: string, validKeys: ReadonlySet<string>): RouteResult | null {
    if (base !== '/' && !pathname.startsWith(base)) return null
    let relative = base === '/' ? pathname : pathname.slice(base.length)
    try { relative = decodeURIComponent(relative) } catch { return null }
    relative = relative.replace(/^\/+|\/+$/g, '')
    if (!relative) return null
    const [key, ...segments] = relative.split('/')
    if (!key || !validKeys.has(key) || segments.some(part => !part || part === '.' || part === '..')) return null
    return { key, articlePath: segments.join('/') }
}
export function buildRoute(key: string, articlePath: string | undefined, base: string): string {
    return base + key + (articlePath ? '/' + articlePath.split('/').map(encodeURIComponent).join('/') : '')
}
