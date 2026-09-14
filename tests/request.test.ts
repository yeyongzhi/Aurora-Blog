import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchJson, safeUrl } from '../src/utils/request'
import { isArticleTree } from '../src/utils/articleTree'

test('URL protocols are explicitly allowed', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,test', 'vbscript:test']) assert.equal(safeUrl(url, 'https://example.com'), null)
    assert.equal(safeUrl('/article', 'https://example.com'), 'https://example.com/article')
})
test('HTTP failures reject before parsing error bodies', async () => {
    const original = globalThis.fetch
    try {
        globalThis.fetch = async () => new Response('not JSON', { status: 404 })
        await assert.rejects(fetchJson('https://example.com'), /404/)
        globalThis.fetch = async () => new Response('{"name":"Aurora"}')
        assert.deepEqual(await fetchJson('https://example.com'), { name: 'Aurora' })
    } finally { globalThis.fetch = original }
})
test('article trees reject malformed data and ambiguous keys', () => {
    assert.equal(isArticleTree([{ key: 'AI', label: 'AI', children: [{ key: 'chapter', label: 'chapter' }] }]), true)
    for (const value of [null, {}, [{ key: 1, label: 'x' }], [{ key: 'x', label: 'x', children: {} }], [{ key: 'x', label: 'x' }, { key: 'x', label: 'duplicate' }]]) assert.equal(isArticleTree(value), false)
})

test('collection indexes have no new missing article files', async () => {
    const { readFile, access } = await import('node:fs/promises')
    const missing: string[] = []
    for (const page of ['note', 'life', 'think', 'interview', 'code']) {
        const tree = JSON.parse(await readFile(`public/${page}.json`, 'utf8'))
        assert.equal(isArticleTree(tree), true, page)
        type TreeNode = { published?: boolean; key: string; children?: TreeNode[] }
        const walk = async (nodes: TreeNode[], ancestors = ''): Promise<void> => {
            for (const node of nodes) {
                if (node.published === false) continue
                const path = `${ancestors}/${node.key}`
                if (node.children?.length) await walk(node.children, path)
                else {
                    try { await access(`public/article/${page}${path}.md`) }
                    catch { missing.push(`${page}${path}.md`) }
                }
            }
        }
        await walk(tree)
    }
    // Existing unpublished entries are documented in README; new broken paths fail CI.
    assert.deepEqual(missing, [])
})
