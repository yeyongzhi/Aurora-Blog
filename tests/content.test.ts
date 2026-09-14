import { test } from 'node:test'
import assert from 'node:assert/strict'
import { searchArticles, type SearchArticle } from '../src/utils/search'
import { publishedTree } from '../src/utils/articleTree'
import { savePosition, readPosition } from '../src/utils/readingPosition'
import { createRss } from '../script/rss'
const article = (title: string, text: string): SearchArticle => ({ path: 'note/中文', title, text, summary: '<script>&', published: '2025-01-01T00:00:00Z', updated: '2026-01-01T00:00:00Z', dateSource: 'git' })
test('search matches body and all terms, with titles ranked first', () => {
    const body = article('Example', 'Vue 状态管理'), title = article('Vue 状态管理', 'example')
    assert.deepEqual(searchArticles([body, title], 'vue 状态'), [title, body])
    assert.deepEqual(searchArticles([body], 'vue nonexistent'), [])
    assert.deepEqual(searchArticles([body], '  '), [])
})
test('unpublished entries and empty groups are excluded', () => {
    assert.deepEqual(publishedTree([{ key: 'a', label: 'a', children: [{ key: 'draft', label: 'draft', published: false }] }, { key: 'b', label: 'b' }]), [{ key: 'b', label: 'b' }])
})
test('reading positions are isolated, bounded and tolerate corrupt storage', () => {
    let value = '{}'; const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next } }
    savePosition(storage, 'one', 500); savePosition(storage, 'two', 100)
    assert.equal(readPosition(storage, 'one'), 500); assert.equal(readPosition(storage, 'other'), 0)
    value = 'invalid'; assert.equal(readPosition(storage, 'one'), 0)
    for (let n = 0; n < 110; n++) savePosition(storage, String(n), n)
    assert.equal(Object.keys(JSON.parse(value)).length, 100)
    assert.doesNotThrow(() => savePosition({ getItem: () => null, setItem: () => { throw Error() } }, 'a', 100))
})
test('RSS escapes user content and encodes unicode canonical URLs', () => {
    const rss = createRss([article('Title & text', 'body')], 'https://example.com/blog/')
    assert.match(rss, /Title &amp; text/); assert.match(rss, /&lt;script&gt;&amp;/)
    assert.match(rss, /blog\/note\/%E4%B8%AD%E6%96%87\//)
    assert.match(rss, /<pubDate>Wed, 01 Jan 2025/)
})
