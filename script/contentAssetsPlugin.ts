import type { Plugin } from 'vite'
import { readFile } from 'node:fs/promises'
export function contentAssetsPlugin(): Plugin {
    const names = ['article-index.json', 'content-report.json', 'rss.xml']
    return { name: 'article-content', configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
            const name = (request.url || '').split('?')[0]!.split('/').at(-1)!
            if (!names.includes(name)) { next(); return }
            try { response.setHeader('Content-Type', name === 'rss.xml' ? 'application/rss+xml' : 'application/json'); response.end(await readFile(`node_modules/.cache/article-content/${name}`)) } catch { next() }
        })
    }, async generateBundle() {
        for (const fileName of names) this.emitFile({ type: 'asset', fileName, source: await readFile(`node_modules/.cache/article-content/${fileName}`) })
    } }
}
