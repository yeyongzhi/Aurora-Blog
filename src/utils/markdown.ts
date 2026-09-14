/// <reference path="../types/markdown-plugins.d.ts" />
import MarkdownIt from 'markdown-it'
import footnote from 'markdown-it-footnote'
import taskLists from 'markdown-it-task-lists'
import mark from 'markdown-it-mark'
import type { Token, Env } from 'markdown-it'
import { safeUrl } from './request'
import { resolveArticleImage } from './images'

export interface ArticleHeading { key: string; label: string; level: number; selectable: boolean; children?: ArticleHeading[] }
export interface RenderedMarkdown { html: string; headings: ArticleHeading[]; title: string; textCount: number; codes: string[]; summary: string }
interface RenderOptions { articlePath?: string; base?: string; interactive?: boolean; highlight?: (code: string, language: string) => string }
interface RenderEnvironment extends Env { options: RenderOptions; headings: ArticleHeading[]; codes: string[] }
export const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
const md = new MarkdownIt({ html: false, linkify: true, breaks: false }).use(footnote).use(taskLists).use(mark)
const defaultValidate = md.validateLink.bind(md)
md.validateLink = url => defaultValidate(url) && Boolean(safeUrl(url, 'https://aurora.invalid/'))

// The only supported raw HTML syntax is an attribute-free underline with escaped contents.
md.inline.ruler.before('html_inline', 'safe_underline', (state, silent) => {
    if (!state.src.startsWith('<u>', state.pos)) return false
    const end = state.src.indexOf('</u>', state.pos + 3)
    if (end === -1) return false
    if (!silent) {
        const token = state.push('html_inline', '', 0)
        token.content = `<u>${md.utils.escapeHtml(state.src.slice(state.pos + 3, end))}</u>`
    }
    state.pos = end + 4
    return true
})
// Consume legacy image dimensions as part of the image syntax, never as arbitrary CSS.
const imageRule = md.inline.ruler.getRules('').find(rule => rule.name === 'image')
if (imageRule) md.inline.ruler.at('image', (state, silent) => {
    if (!imageRule(state, silent)) return false
    const dimensions = /^\(([\d.]+(?:px|%|rem|em)?),\s*([\d.]+(?:px|%|rem|em)?|auto)\)/.exec(state.src.slice(state.pos))
    if (dimensions) {
        const image = state.tokens[state.tokens.length - 1]
        if (!silent && image?.type === 'image') {
            const dimension = (value: string) => /^\d+(?:\.\d+)?$/.test(value) ? `${value}px` : value
            image.attrSet('style', `width:${dimension(dimensions[1]!)};height:${dimension(dimensions[2]!)}`)
        }
        state.pos += dimensions[0].length
    }
    return true
})
md.renderer.rules.table_open = () => '<div class="markdown-table"><table>\n'
md.renderer.rules.table_close = () => '</table></div>\n'
const linkOpen = md.renderer.rules.link_open
md.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
    const env = environment as RenderEnvironment
    const token = tokens[index]!
    const href = String(token.attrGet('href') || '')
    if (href && !href.startsWith('#')) {
        token.attrSet('target', '_blank')
        token.attrSet('rel', 'noopener noreferrer')
    }
    return linkOpen ? linkOpen(tokens, index, options, env, renderer) : renderer.renderToken(tokens, index, options)
}
md.renderer.rules.image = (tokens, index, options, environment, renderer) => {
    const env = environment as RenderEnvironment
    const token = tokens[index]!
    const base = env.options.base || '/'
    const original = resolveArticleImage(String(token.attrGet('src') || ''), env.options.articlePath || 'article/index.md', base)
    if (!original) return md.utils.escapeHtml(token.content)
    token.attrSet('src', original)
    token.attrSet('alt', token.content)
    token.attrSet('loading', 'lazy')
    token.attrSet('decoding', 'async')
    return renderer.renderToken(tokens, index, options)
}
function codeBlock(tokens: Token[], index: number, env: RenderEnvironment): string {
    const token = tokens[index]!
    const language = (token.info.trim().split(/\s+/)[0] || 'plaintext').toLowerCase()
    const codeIndex = env.codes.push(token.content) - 1
    let html = md.utils.escapeHtml(token.content)
    if (env.options.highlight) html = env.options.highlight(token.content, language)
    const button = env.options.interactive === false ? '' : `<button type="button" data-copy-code="${codeIndex}" aria-label="复制第 ${codeIndex + 1} 个代码块">复制代码</button>`
    return `<div class="markdown-code"><div class="markdown-code-toolbar"><span>${md.utils.escapeHtml(language)}</span>${button}</div><pre><code class="language-${md.utils.escapeHtml(language)}">${html}</code></pre></div>\n`
}
md.renderer.rules.fence = (tokens, index, _options, env) => codeBlock(tokens, index, env as RenderEnvironment)
md.renderer.rules.code_block = md.renderer.rules.fence!
const tokenText = (token: Token): string => token.children ? token.children.map(tokenText).join('') : ['text', 'code_inline', 'image'].includes(token.type) ? token.content : token.type === 'softbreak' || token.type === 'hardbreak' ? '\n' : ''

export function renderMarkdown(source: string, options: RenderOptions = {}): RenderedMarkdown {
    // Normalize historical unchecked tasks only outside fenced and indented code.
    let fence = ''
    const normalized = source.split(/\r?\n/).map(line => {
        const match = /^\s{0,3}(`{3,}|~{3,})/.exec(line)
        if (match) {
            if (!fence) fence = match[1]!
            else if (match[1]![0] === fence[0] && match[1]!.length >= fence.length && /^\s{0,3}(`{3,}|~{3,})\s*$/.test(line)) fence = ''
            return line
        }
        return !fence ? line.replace(/^( {0,3}- )\[\](\s)/, '$1[ ]$2') : line
    }).join('\n')
    const env: RenderEnvironment = { options, headings: [], codes: [] }
    const tokens = md.parse(normalized, env)
    const text: string[] = []
    for (let index = 0; index < tokens.length; index++) {
        const token = tokens[index]!
        if (token.type === 'heading_open') {
            const inline = tokens[index + 1]!
            const heading = { key: `md_nav_${env.headings.length}`, label: tokenText(inline), level: Number(token.tag.slice(1)), selectable: true }
            token.attrSet('id', heading.key)
            env.headings.push(heading)
        }
        if (token.type === 'inline') text.push(tokenText(token))
    }
    const html = md.renderer.render(tokens, md.options, env)
    const plain = text.join('\n')
    return { html, headings: env.headings, title: env.headings.find(heading => heading.level === 1)?.label || '', textCount: plain.replace(/\s/g, '').length, codes: env.codes, summary: plain.replace(/\s+/g, ' ').slice(0, 160) }
}
export const renderInline = (source: string): string => md.renderInline(source, { options: {}, headings: [], codes: [] })
