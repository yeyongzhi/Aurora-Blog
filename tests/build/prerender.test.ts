import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'

test('production article pages expose text and sharing metadata without JavaScript', async () => {
    const html = await readFile('dist/note/AI/helloAgents/chapter1/index.html', 'utf8')
    assert.match(html, /<title>初识智能体 · Aurora Blog<\/title>/)
    assert.match(html, /property="og:title" content="初识智能体"/)
    assert.match(html, /<article class="markdown-body">[\s\S]*一.什么是智能体/)
    assert.match(html, /rel="noopener noreferrer"/)
    assert.doesNotMatch(html, /<div id="app"><\/div>/)
})
test('production assets no longer include custom font payloads or giant icon bundles', async () => {
    const files = await readdir('dist/assets')
    assert.equal(files.some(file => /\.(ttf|otf|woff2?)$/.test(file)), false)
    assert.equal(files.some(file => file.startsWith('lucide-vue-next-')), false)
})


test('build uses original images without generated conversion assets', async () => {
    const entries = await readdir('dist')
    assert.equal(entries.includes('_images'), false)
    assert.equal(entries.includes('image-manifest.json'), false)
})

test('published catalog, local content report, RSS and date metadata are generated', async () => {
    const catalog = JSON.parse(await readFile('dist/article-index.json', 'utf8'))
    const report = JSON.parse(await readFile('dist/content-report.json', 'utf8'))
    assert.equal(catalog.length, report.articles)
    assert.deepEqual(report.issues, [])
    assert.equal(report.drafts.length, 4)
    assert.equal(catalog.some((item: { path: string }) => report.drafts.includes(item.path)), false)
    assert.match(await readFile('dist/rss.xml', 'utf8'), /<rss version="2.0"/)
    const html = await readFile('dist/note/AI/helloAgents/chapter1/index.html', 'utf8')
    assert.match(html, /property="article:published_time"/)
    assert.match(html, /application\/ld\+json/)
    assert.match(await readFile('dist/sitemap.xml', 'utf8'), /<lastmod>/)
})
