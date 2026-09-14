import { createRss } from './rss'
import { mkdir, readFile, writeFile, stat, access } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import { renderMarkdown } from '../src/utils/markdown'
import { isArticleTree } from '../src/utils/articleTree'
import type { NoteTreeItem } from '../src/types/Note'
import type { SearchArticle } from '../src/utils/search'
const base = '/Aurora-Blog/'
const cache = 'node_modules/.cache/article-content'
await mkdir(cache, { recursive: true })
const articles: SearchArticle[] = []
const issues: { article: string; target: string; type: string }[] = [], drafts: string[] = [], external = new Set<string>()
const md = new MarkdownIt({ html: false })
for (const page of ['note', 'life', 'think', 'interview', 'code']) {
    const tree = JSON.parse(await readFile(`public/${page}.json`, 'utf8'))
    if (!isArticleTree(tree)) throw new Error(`Invalid tree: ${page}`)
    async function walk(nodes: NoteTreeItem[], parents: string[] = []) {
        for (const node of nodes) {
            const segments = [...parents, node.key], route = `${page}/${segments.join('/')}`
            if (node.published === false) { drafts.push(route); continue }
            if (node.children?.length) { await walk(node.children, segments); continue }
            const file = `public/article/${route}.md`
            let source: string
            try { source = await readFile(file, 'utf8') } catch { issues.push({ article: route, target: file, type: 'missing-article' }); continue }
            const document = renderMarkdown(source, { articlePath: `article/${route}.md`, base, interactive: false })
            let dates: string[] = []
            try { dates = execFileSync('git', ['log', '--follow', '--format=%aI', '--', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().split('\n').filter(Boolean) } catch {}
            const fallback = (await stat(file)).mtime.toISOString()
            const text = md.utils.unescapeAll(document.html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
            articles.push({ path: route, title: document.title || node.label, summary: document.summary, text, published: dates.at(-1) || fallback, updated: dates[0] || fallback, dateSource: dates.length ? 'git' : 'file' })
            for (const match of document.html.matchAll(/<(img|a)\b[^>]*\b(?:src|href)="([^"]+)"/g)) {
                const url = md.utils.unescapeAll(match[2]!)
                if (/^https?:\/\//.test(url)) { external.add(url); continue }
                if (/^(#|mailto:)/.test(url)) continue
                try {
                    const resolved = new URL(url, `https://local.invalid${base}article/${route}.md`)
                    const local = decodeURIComponent(resolved.pathname)
                    if (!local.startsWith(base)) { issues.push({ article: route, target: url, type: 'outside-base' }); continue }
                    const relative = local.slice(base.length)
                    if (relative.startsWith('article/') || match[1] === 'img') {
                        const target = path.resolve('public', relative)
                        if (!target.startsWith(path.resolve('public') + path.sep)) throw new Error('outside public')
                        try { await access(target) } catch { issues.push({ article: route, target: url, type: match[1] === 'img' ? 'missing-image' : 'missing-link' }) }
                    } else if (relative) {
                        // Validate application article routes after the catalog is complete.
                        issues.push({ article: route, target: relative.replace(/\/$/, ''), type: 'route-check' })
                    }
                } catch { issues.push({ article: route, target: url, type: 'invalid-url' }) }
            }
        }
    }
    await walk(tree)
}
const pages = new Set(['home','welcome','life','think','note','interview','code','nav','toolbox','alife','tool','contact','about','version'])
const known = new Set(articles.map(article => article.path))
const broken = issues.filter(issue => issue.type !== 'route-check' || (!known.has(issue.target) && !pages.has(issue.target)))
await writeFile(`${cache}/article-index.json`, JSON.stringify(articles))
await writeFile(`${cache}/content-report.json`, JSON.stringify({ articles: articles.length, drafts, issues: broken, externalLinksNotChecked: [...external] }, null, 2))
console.log(`Content: ${articles.length} published articles, ${drafts.length} drafts, ${broken.length} local issues; ${external.size} external URLs listed without network checks`)
if (broken.length) console.log(JSON.stringify(broken, null, 2))

if (broken.length) process.exitCode = 1

await writeFile(`${cache}/rss.xml`, createRss(articles, (process.env.SITE_URL || 'https://yeyongzhi.github.io/Aurora-Blog/').replace(/\/?$/, '/')))
