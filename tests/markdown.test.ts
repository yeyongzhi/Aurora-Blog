import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { renderMarkdown, renderInline } from '../src/utils/markdown'

test('underline and inline code cannot inject HTML', () => {
    assert.equal(renderInline('<u><img src=x onerror=alert(1)></u>'), '<u>&lt;img src=x onerror=alert(1)&gt;</u>')
    assert.equal(renderInline('`**bold** <img>`'), '<code>**bold** &lt;img&gt;</code>')
    for (const source of ['[click](javascript:alert)', '[click](data:text/html,test)', '<img src=x onerror=alert(1)>']) assert.doesNotMatch(renderInline(source), /<a |<img /)
})
test('standard and legacy task syntax renders disabled checkboxes', () => {
    const { html } = renderMarkdown('- [ ] first\n- [] second\n- [X] third')
    assert.equal((html.match(/type="checkbox"/g) || []).length, 3)
    assert.equal((html.match(/checked=""/g) || []).length, 1)
    assert.equal((html.match(/disabled=""/g) || []).length, 3)
})
test('legacy strong labels render when text follows the closing marker immediately', () => {
    const { html } = renderMarkdown('- **【CPU】**Intel i5-12400F')
    assert.match(html, /<strong>【CPU】<\/strong>Intel i5-12400F/)
    assert.equal(renderInline('`**【CPU】**Intel`'), '<code>**【CPU】**Intel</code>')
})
test('code fences retain language, raw code and unfinished blocks', () => {
    const source = '```python\n# title\n- [] code\n```'
    const article = renderMarkdown(source)
    assert.deepEqual(article.codes, ['# title\n- [] code\n'])
    assert.match(article.html, /language-python/)
    assert.match(article.html, /data-copy-code="0"/)
    assert.deepEqual(renderMarkdown('~~~ts\nconst a = 1').codes, ['const a = 1'])
    assert.doesNotMatch(renderMarkdown(source, { interactive: false }).html, /data-copy-code/)
})
test('table, nested list and footnote structures are retained', () => {
    const { html } = renderMarkdown('| A | B |\n| --- | --- |\n| x | y |\n\n- parent\n  - child\n\nfootnote[^1]\n\n[^1]: reference')
    assert.match(html, /<table>[\s\S]*<th>A<\/th>/)
    assert.match(html, /<li>parent[\s\S]*<ul>[\s\S]*<li>child/)
    assert.match(html, /href="#fn1"/)
    assert.match(html, /class="footnotes"/)
})
test('heading ids are unique even for duplicate and skipped levels', () => {
    const { headings, html } = renderMarkdown('## same\n\n#### same\n\n## same')
    assert.equal(new Set(headings.map(heading => heading.key)).size, 3)
    assert.deepEqual(headings.map(heading => heading.level), [2, 4, 2])
    assert.match(html, /id="md_nav_2"/)
})
test('legacy image sizes preserve original image paths', () => {
    const { html } = renderMarkdown('![image](images/a.png)(300, auto)', { articlePath: 'article/note/test.md', base: '/Aurora-Blog/' })
    assert.match(html, /style="width:300px;height:auto"/)
    assert.match(html, /src="\/Aurora-Blog\/article\/note\/images\/a.png"/)
    assert.doesNotMatch(renderMarkdown('![x](javascript:alert)').html, /<img /)
})
test('long articles do not exhaust the call stack', () => {
    const source = Array(20000).fill('paragraph').join('\n')
    assert.doesNotThrow(() => renderMarkdown(source))
})
test('all existing articles render', async () => {
    async function walk(path: string): Promise<void> {
        for (const entry of await readdir(path, { withFileTypes: true })) {
            const full = `${path}/${entry.name}`
            if (entry.isDirectory()) await walk(full)
            else if (entry.name.endsWith('.md')) renderMarkdown(await readFile(full, 'utf8'), { articlePath: full.replace(/^public\//, '') })
        }
    }
    await walk('public/article')
})
