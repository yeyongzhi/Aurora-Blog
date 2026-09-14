import { escapeHtml } from '../src/utils/markdown'
import type { SearchArticle } from '../src/utils/search'
export function createRss(articles: SearchArticle[], siteUrl: string): string {
    const link = (route: string) => new URL(route.split('/').map(encodeURIComponent).join('/') + '/', siteUrl).href
    const sorted = [...articles].sort((a,b) => Date.parse(b.updated) - Date.parse(a.updated))
    return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Aurora Blog</title><link>${escapeHtml(siteUrl)}</link><description>记录前端开发、AI 学习与生活思考</description><language>zh-CN</language><atom:link href="${escapeHtml(new URL('rss.xml', siteUrl).href)}" rel="self" type="application/rss+xml"/>${sorted[0] ? `<lastBuildDate>${new Date(sorted[0].updated).toUTCString()}</lastBuildDate>` : ''}${sorted.slice(0,50).map(article => `<item><title>${escapeHtml(article.title)}</title><link>${escapeHtml(link(article.path))}</link><guid isPermaLink="true">${escapeHtml(link(article.path))}</guid><description>${escapeHtml(article.summary)}</description><pubDate>${new Date(article.published).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`
}
