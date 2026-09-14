export function resolveArticleImage(source: string, articlePath: string, base: string): string {
    try {
        const articleUrl = new URL(base + articlePath.replace(/^\/+/, ''), 'https://aurora.invalid')
        const target = source.startsWith('/article/') ? base + source.slice(1) : source
        const url = new URL(target, articleUrl)
        if (!['http:', 'https:'].includes(url.protocol)) return ''
        return url.origin === articleUrl.origin ? url.pathname + url.search + url.hash : url.href
    } catch { return '' }
}
