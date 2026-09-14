import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseRoute, buildRoute } from '../src/router/path'
const keys = new Set(['note', 'home'])
test('unicode article paths round-trip under subpath deployments', () => {
    const path = buildRoute('note', 'AI/中文笔记', '/Aurora-Blog/')
    assert.match(path, /%E4/)
    assert.deepEqual(parseRoute(path, '/Aurora-Blog/', keys), { key: 'note', articlePath: 'AI/中文笔记' })
})
test('unknown, malformed and traversal paths are rejected', () => {
    for (const path of ['/else/note', '/Aurora-Blog/unknown', '/Aurora-Blog/note/%ZZ', '/Aurora-Blog/note/../x']) assert.equal(parseRoute(path, '/Aurora-Blog/', keys), null)
    assert.deepEqual(parseRoute('/note/AI', '/', keys), { key: 'note', articlePath: 'AI' })
})
