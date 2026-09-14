import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveArticleImage } from '../src/utils/images'
test('article images resolve within deployment base and unsafe schemes are rejected', () => {
    assert.equal(resolveArticleImage('images/中文.png', '/article/note/test.md', '/Aurora-Blog/'), '/Aurora-Blog/article/note/images/%E4%B8%AD%E6%96%87.png')
    assert.equal(resolveArticleImage('/article/note/a.png', '/article/note/test.md', '/Aurora-Blog/'), '/Aurora-Blog/article/note/a.png')
    assert.equal(resolveArticleImage('https://example.com/a.png', 'article/note/a.md', '/'), 'https://example.com/a.png')
    for (const url of ['javascript:alert(1)', 'data:image/svg+xml,test', 'mailto:test']) assert.equal(resolveArticleImage(url, 'article/note/a.md', '/'), '')
})
