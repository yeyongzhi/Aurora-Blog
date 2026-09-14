import { createRss } from './rss'
import type { SearchArticle } from '../src/utils/search'
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { renderMarkdown, escapeHtml } from '../src/utils/markdown'
import { isArticleTree } from '../src/utils/articleTree'
import type { NoteTreeItem } from '../src/types/Note'
import config from '../vite.config'

const base = config.base || '/'
const template = await readFile('dist/index.html', 'utf8')
const siteUrl = (process.env.SITE_URL || 'https://yeyongzhi.github.io/Aurora-Blog/').replace(/\/?$/, '/')
const catalog: SearchArticle[] = JSON.parse(await readFile('dist/article-index.json', 'utf8'))
const markdownCss = (await readdir('dist/assets')).find(file => /^MarkDown-.*\.css$/.test(file))
const urls: string[] = []
let count = 0
for (const page of ['note', 'life', 'think', 'interview', 'code']) {
    const tree: unknown = JSON.parse(await readFile(`public/${page}.json`, 'utf8'))
    if (!isArticleTree(tree)) throw new Error(`Invalid article tree: ${page}`)
    async function walk(nodes: NoteTreeItem[], parents: string[] = []) {
        for (const node of nodes) {
            if (node.published === false) continue
            const segments = [...parents, node.key]
            if (node.children?.length) { await walk(node.children, segments); continue }
            const file = `public/article/${page}/${segments.join('/')}.md`
            let source: string
            try { source = await readFile(file, 'utf8') }
            catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue; throw error }
            const article = renderMarkdown(source, { articlePath: file.replace(/^public\//, ''), base, interactive: false })
            const title = article.title || node.label
            const description = article.summary || title
            const route = `${page}/${segments.map(encodeURIComponent).join('/')}/`
            const metadata = catalog.find(item => item.path === `${page}/${segments.join('/')}`)!
            const canonical = siteUrl ? new URL(route, siteUrl).href : null
            let html = template.replace(/<title>.*?<\/title>/, () => `<title>${escapeHtml(title)} · Aurora Blog</title>`)
                .replace(/(<meta name="description" content=")[^"]*("[^>]*>)/, (_, before, after) => `${before}${escapeHtml(description)}${after}`)
                .replace(/(<meta property="og:title" content=")[^"]*("[^>]*>)/, (_, before, after) => `${before}${escapeHtml(title)}${after}`)
                .replace(/(<meta property="og:description" content=")[^"]*("[^>]*>)/, (_, before, after) => `${before}${escapeHtml(description)}${after}`)
                .replace('content="website"', 'content="article"')
                .replace('<div id="app"></div>', () => `<div id="app"><main style="max-width:960px;margin:auto;padding:24px"><nav><a href="${base}">Aurora Blog</a></nav><article class="markdown-body">${article.html}</article></main></div>`)
            const structured = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title, description, datePublished: metadata.published, dateModified: metadata.updated, author: { '@type': 'Person', name: 'Aurora' }, ...(canonical ? { url: canonical } : {}) }
            html = html.replace('</head>', `${markdownCss ? `<link rel="stylesheet" href="${base}assets/${markdownCss}">` : ''}<meta property="article:published_time" content="${metadata.published}"><meta property="article:modified_time" content="${metadata.updated}"><script type="application/ld+json">${JSON.stringify(structured).replace(/</g, '\\u003c')}</script></head>`)
            if (canonical) {
                html = html.replace('</head>', `<link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:url" content="${escapeHtml(canonical)}"></head>`)
                urls.push(canonical)
            }
            const output = path.join('dist', page, ...segments)
            await mkdir(output, { recursive: true })
            await writeFile(path.join(output, 'index.html'), html)
            count++
        }
    }
    await walk(tree)
}
if (siteUrl) {
    await writeFile('dist/rss.xml', createRss(catalog, siteUrl))
    await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[siteUrl, ...urls].map(url => { const article = catalog.find(item => new URL(item.path.split('/').map(encodeURIComponent).join('/') + '/', siteUrl).href === url); return `<url><loc>${escapeHtml(url)}</loc>${article ? `<lastmod>${article.updated}</lastmod>` : ''}</url>` }).join('')}</urlset>`)
}
console.log(`Prerendered ${count} article pages`)

