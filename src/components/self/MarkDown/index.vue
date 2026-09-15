<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { ChevronsUpIcon, ChevronsDownIcon, ArrowUpIcon } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Loading from '@/components/self/Loading/index.vue'
import Tree from '@/components/self/Tree/index.vue'
import { readPosition, savePosition } from '@/utils/readingPosition'
import { fetchJson } from '@/utils/request'
import type { SearchArticle } from '@/utils/search'
import { renderMarkdown, escapeHtml, type ArticleHeading, type RenderedMarkdown } from '@/utils/markdown'
import { getMarkDownData } from '@/utils'
import message from '@/plugins/message'
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import typescript from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);
hljs.registerLanguage('sql', sql);


dayjs.extend(utc)
dayjs.extend(timezone)
const props = withDefaults(defineProps<{ path: string; showInfo?: boolean; showGuide?: boolean }>(), { showInfo: true, showGuide: true })
const documentData = shallowRef<RenderedMarkdown | null>(null)
const lastModified = ref('')
const published = ref('')
const dateSource = ref('')
let catalog: Promise<SearchArticle[]> | undefined
const readCatalog = () => catalog ||= fetchJson<SearchArticle[]>(`${import.meta.env.BASE_URL}article-index.json`, AbortSignal.timeout(1500)).catch(() => [])
let readingPath = '', readingTop = 0, lastSaved = 0
const persistReading = () => { try { savePosition(localStorage, readingPath, readingTop) } catch {} }
const rememberScroll = (event: Event) => {
    const target = event.target
    if (!readingPath || !(target instanceof HTMLElement) || target.dataset.slot !== 'scroll-area-viewport') return
    readingTop = target.scrollTop
    if (Date.now() - lastSaved > 300) { persistReading(); lastSaved = Date.now() }
}
const loading = ref(false)
const error = ref('')
const reloadKey = ref(0)
const guideVisible = ref(window.matchMedia('(min-width: 1024px)').matches)
const currentNavKey = ref('')
const scrollRoot = shallowRef<{ scrollTo: (options: ScrollToOptions) => void } | null>(null)
const highlight = (code: string, language: string) => {
    try { return hljs.getLanguage(language) ? hljs.highlight(code, { language }).value : escapeHtml(code) }
    catch { return escapeHtml(code) }
}
const scrollToTop = () => scrollRoot.value?.scrollTo({ top: 0, behavior: 'smooth' })
const scrollToSection = () => {
    let fragment = ''
    try { fragment = decodeURIComponent(location.hash.slice(1)) } catch { return }
    if (!fragment) return
    const root = articleRoot.value
    const target = root && Array.from(root.querySelectorAll<HTMLElement>('[id]')).find(element => element.id === fragment || (element.tagName.match(/^H[1-6]$/) && element.textContent?.trim() === fragment))
    if (target) scrollRoot.value?.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
}
const articleRoot = shallowRef<HTMLElement | null>(null)
watch([() => props.path, reloadKey], async ([path], _, onCleanup) => {
    const controller = new AbortController()
    let active = true
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    onCleanup(() => { active = false; controller.abort(); clearTimeout(timeout) })
    persistReading(); readingPath = ''; readingTop = 0
    published.value = ''; dateSource.value = ''
    documentData.value = null
    lastModified.value = ''
    currentNavKey.value = ''
    error.value = ''
    for (const property of ['article:published_time', 'article:modified_time']) document.querySelector(`meta[property="${property}"]`)?.remove()
    loading.value = Boolean(path)
    if (!path) { clearTimeout(timeout); return }
    try {
        const { content, lastModified: modified } = await getMarkDownData(path, controller.signal)
        if (!active) return
        if (content === null) throw new Error('文章加载失败，请检查网络或文章路径')
        documentData.value = renderMarkdown(content, { articlePath: path, base: import.meta.env.BASE_URL, highlight })
        const article = documentData.value
        document.title = article.title ? `${article.title} · Aurora Blog` : 'Aurora Blog'
        for (const name of ['description', 'og:description']) document.querySelector(`meta[${name.startsWith('og:') ? 'property' : 'name'}="${name}"]`)?.setAttribute('content', article.summary)
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', article.title || 'Aurora Blog')
        document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'article')
        const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
        if (canonical) {
            const route = path.replace(/^\/?article\//, '').replace(/\.md$/, '').split('/').map(encodeURIComponent).join('/')
            canonical.href = new URL(`${import.meta.env.BASE_URL}${route}/`, canonical.href).href
            document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical.href)
        }
        let schemaElement = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]')
        if (!schemaElement) { schemaElement = document.createElement('script'); schemaElement.type = 'application/ld+json'; document.head.append(schemaElement) }
        const schema = schemaElement
        schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title, description: article.summary, author: { '@type': 'Person', name: 'Aurora' } })
        if (modified) lastModified.value = dayjs(modified).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')

        void readCatalog().then(articles => {
            if (!active) return
            const metadata = articles.find(item => `article/${item.path}.md` === path.replace(/^\//, ''))
            if (!metadata) return
            published.value = dayjs(metadata.published).format('YYYY-MM-DD')
            dateSource.value = metadata.dateSource
            lastModified.value = dayjs(metadata.updated || modified).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
            for (const [property, content] of [['article:published_time', metadata.published], ['article:modified_time', metadata.updated], ['og:type', 'article']]) {
                let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
                if (content) { if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property!); document.head.append(tag) } tag.content = content }
                else tag?.remove()
            }
            schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title, description: article.summary, datePublished: metadata.published, dateModified: metadata.updated, author: { '@type': 'Person', name: 'Aurora' } })
        })
    } catch (cause) { if (active) error.value = cause instanceof Error ? cause.message : '文章解析失败' }
    finally {
        clearTimeout(timeout)
        if (active) {
            loading.value = false
            await nextTick()
            if (active && documentData.value) {
                let top = 0; try { top = readPosition(localStorage, path) } catch {}
                scrollRoot.value?.scrollTo({ top, behavior: 'instant' as ScrollBehavior })
                readingPath = path; readingTop = top
                scrollToSection()
            }
        }
    }
}, { immediate: true })
const headings = computed(() => {
    const roots: ArticleHeading[] = [], stack: ArticleHeading[] = []
    for (const original of documentData.value?.headings || []) {
        const heading = { ...original }
        while (stack.length && stack[stack.length - 1]!.level >= heading.level) stack.pop()
        const parent = stack[stack.length - 1]
        if (parent) (parent.children ||= []).push(heading)
        else roots.push(heading)
        stack.push(heading)
    }
    return roots
})
watch(currentNavKey, key => { if (key) location.hash = key })
const copyCode = async (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[data-copy-code]') : null
    if (!target || !articleRoot.value?.contains(target)) return
    const code = documentData.value?.codes[Number(target.dataset.copyCode)]
    if (code === undefined) return
    try {
        await navigator.clipboard.writeText(code)
        message.success('代码已复制')
    } catch { message.error('复制失败，请选择代码后手动复制') }
}
onMounted(() => window.addEventListener('hashchange', scrollToSection))
onUnmounted(() => {
    persistReading()
    document.querySelector('script[type="application/ld+json"]')?.remove()
    for (const property of ['article:published_time', 'article:modified_time']) document.querySelector(`meta[property="${property}"]`)?.remove()
    document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'website')
    window.removeEventListener('hashchange', scrollToSection)
    document.title = 'Aurora Blog'
    document.querySelector('link[rel="canonical"]')?.remove()
    document.querySelector('meta[property="og:url"]')?.remove()
    for (const name of ['description', 'og:description']) document.querySelector(`meta[${name.startsWith('og:') ? 'property' : 'name'}="${name}"]`)?.setAttribute('content', 'Aurora 的个人博客，记录前端开发、AI 学习与生活思考。')
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'Aurora Blog')
})
</script>

<template>
    <div class="relative h-full w-full overflow-hidden" @scroll.capture="rememberScroll">
        <Loading v-if="loading" class="h-full w-full" description="文章加载中..." />
        <div v-else-if="error" role="alert" class="flex flex-col items-center gap-4 p-6"><p>{{ error }}</p><Button variant="outline" @click="reloadKey++">重试</Button></div>
        <ScrollArea v-else ref="scrollRoot" class="h-full w-full pt-14 lg:pt-0" :class="{ 'lg:pr-[330px]': props.showGuide && guideVisible }">
            <div v-if="props.showInfo && documentData" class="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span v-if="published">发布于 {{ published }}</span><span v-if="dateSource === 'file'">日期来自文件时间</span>
                <span v-if="lastModified">更新于 {{ lastModified }}</span>
                <span>{{ documentData.textCount }} 字</span><span>{{ Math.max(1, Math.ceil(documentData.textCount / 400)) }} 分钟</span>
            </div>
            <article ref="articleRoot" class="markdown-body" @click="copyCode" v-html="documentData?.html || ''" />
        </ScrollArea>
        <div v-if="props.showGuide && documentData?.headings.length" class="absolute right-2 top-2 max-w-[calc(100%-1rem)]">
            <Card class="max-w-full gap-4 py-4" :class="guideVisible ? 'w-[300px]' : 'w-fit'">
                <CardHeader><CardTitle v-if="guideVisible">文章目录</CardTitle><CardDescription v-if="guideVisible">共 {{ documentData.headings.length }} 个章节</CardDescription>
                    <CardAction><Button size="sm" variant="secondary" aria-label="切换文章目录" :aria-expanded="guideVisible" @click="guideVisible = !guideVisible"><ChevronsUpIcon v-if="guideVisible" /><ChevronsDownIcon v-else /></Button></CardAction>
                </CardHeader>
                <CardContent v-show="guideVisible" class="max-h-[60dvh] overflow-auto"><Tree :data="headings" v-model:currentKey="currentNavKey" /></CardContent>
            </Card>
        </div>
        <Button class="absolute bottom-2 right-2" size="icon" variant="secondary" aria-label="回到顶部" @click="scrollToTop"><ArrowUpIcon /></Button>
    </div>
</template>

<style>
.markdown-body { color: var(--foreground); overflow-wrap: anywhere; line-height: 1.8; }
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { color: var(--foreground); scroll-margin-top: 1.5rem; }
.markdown-body h1 { font-size: 2.25rem; font-weight: 800; margin: 0 0 1rem; line-height: 1.3; letter-spacing: -.025em; }
.markdown-body h2 { font-size: 1.875rem; font-weight: 700; margin: 1.75rem 0 1rem; line-height: 1.4; padding-bottom: .35rem; border-bottom: 1px solid var(--border); }
.markdown-body h3 { font-size: 1.5rem; font-weight: 650; margin: 1.5rem 0 .75rem; }
.markdown-body h4, .markdown-body h5, .markdown-body h6 { font-size: 1.125rem; font-weight: 650; margin: 1.25rem 0 .5rem; }
.markdown-body p { margin: .75rem 0; }
.markdown-body strong { font-weight: 750; color: var(--foreground); }
.markdown-body em { font-style: italic; }
.markdown-body del { color: var(--muted-foreground); text-decoration-thickness: 1.5px; }
.markdown-body mark { border-radius: .2rem; padding: .05em .22em; background: color-mix(in oklch, var(--primary) 20%, transparent); color: inherit; }
.markdown-body ul { list-style: disc; padding-left: 1.5rem; margin: .65rem 0; }
.markdown-body ol { list-style: decimal; padding-left: 1.5rem; margin: .65rem 0; }
.markdown-body li { margin: .25rem 0; padding-left: .15rem; }
.markdown-body li > ul, .markdown-body li > ol { margin: .2rem 0; }
.markdown-body .contains-task-list { list-style: none; padding-left: .35rem; }
.markdown-body .task-list-item { display: flex; align-items: flex-start; gap: .55rem; }
.markdown-body input[type=checkbox] { width: 1rem; height: 1rem; margin-top: .42rem; accent-color: var(--primary); flex: none; }
.markdown-body blockquote { border-left: 4px solid var(--primary); border-radius: 0 .5rem .5rem 0; padding: .65rem 1rem; margin: 1.25rem 0; color: var(--muted-foreground); background: color-mix(in oklch, var(--muted) 65%, transparent); }
.markdown-body blockquote > :first-child { margin-top: 0; }
.markdown-body blockquote > :last-child { margin-bottom: 0; }
.markdown-body a { color: var(--primary); font-weight: 550; text-decoration: underline; text-decoration-color: color-mix(in oklch, var(--primary) 45%, transparent); text-underline-offset: 3px; transition: text-decoration-color .15s ease; }
.markdown-body a:hover { text-decoration-color: var(--primary); }
.markdown-body img { display: block; max-width: 100%; height: auto; margin: 1.25rem auto; border: 1px solid var(--border); border-radius: .75rem; box-shadow: 0 8px 24px color-mix(in oklch, var(--foreground) 8%, transparent); }
.markdown-body .markdown-table { overflow-x: auto; margin: 1.25rem 0; border: 1px solid var(--border); border-radius: .65rem; }
.markdown-body table { border-collapse: collapse; width: 100%; }
.markdown-body th, .markdown-body td { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: .6rem .8rem; min-width: 6rem; text-align: left; }
.markdown-body th:last-child, .markdown-body td:last-child { border-right: 0; }
.markdown-body tr:last-child td { border-bottom: 0; }
.markdown-body th { background: var(--muted); font-weight: 700; }
.markdown-body tbody tr:nth-child(even) { background: color-mix(in oklch, var(--muted) 45%, transparent); }
.markdown-body tbody tr { transition: background-color .15s ease; }
.markdown-body tbody tr:hover { background: color-mix(in oklch, var(--muted) 80%, transparent); }
.markdown-body .markdown-code { margin: 1.35rem 0; border: 1px solid color-mix(in oklch, var(--border) 80%, var(--primary)); border-radius: .75rem; overflow: hidden; background: #f8fafc; box-shadow: 0 8px 24px color-mix(in oklch, var(--foreground) 8%, transparent); }
.markdown-body .markdown-code-toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 2.6rem; padding: .45rem .65rem .45rem .9rem; border-bottom: 1px solid var(--border); background: color-mix(in oklch, var(--muted) 75%, transparent); }
.markdown-body .markdown-code-language { color: var(--muted-foreground); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.markdown-body button[data-copy-code] { cursor: pointer; border: 1px solid var(--border); padding: .3rem .65rem; border-radius: .4rem; background: var(--background); color: var(--foreground); font-size: .75rem; font-weight: 600; line-height: 1.2; transition: background-color .15s ease, border-color .15s ease, transform .15s ease; }
.markdown-body button[data-copy-code]:hover { border-color: var(--primary); background: var(--accent); }
.markdown-body button[data-copy-code]:active { transform: scale(.96); }
.markdown-body button[data-copy-code]:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
.markdown-body pre { overflow-x: auto; white-space: pre; padding: 1rem 1.1rem 1.15rem; color: #24292f; background: transparent; font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace; font-size: .875rem; line-height: 1.7; tab-size: 4; }
.markdown-body pre::-webkit-scrollbar { height: .65rem; }
.markdown-body pre::-webkit-scrollbar-track { background: transparent; }
.markdown-body pre::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 999px; background: color-mix(in oklch, var(--muted-foreground) 45%, transparent); background-clip: padding-box; }
.markdown-body :not(pre) > code { border: 1px solid color-mix(in oklch, var(--border) 75%, var(--primary)); border-radius: .3rem; background: color-mix(in oklch, var(--muted) 75%, transparent); padding: .12em .38em; color: var(--foreground); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: .88em; }
.markdown-body .hljs-comment, .markdown-body .hljs-quote { color: #6e7781; font-style: italic; }
.markdown-body .hljs-keyword, .markdown-body .hljs-selector-tag, .markdown-body .hljs-literal { color: #cf222e; }
.markdown-body .hljs-string, .markdown-body .hljs-doctag, .markdown-body .hljs-regexp { color: #0a3069; }
.markdown-body .hljs-title, .markdown-body .hljs-section, .markdown-body .hljs-name { color: #8250df; font-weight: 700; }
.markdown-body .hljs-number, .markdown-body .hljs-symbol, .markdown-body .hljs-bullet { color: #0550ae; }
.markdown-body .hljs-attr, .markdown-body .hljs-attribute, .markdown-body .hljs-variable, .markdown-body .hljs-template-variable { color: #953800; }
.markdown-body .hljs-built_in, .markdown-body .hljs-type, .markdown-body .hljs-meta { color: #116329; }
.dark .markdown-body .markdown-code { background: #0d1117; border-color: #30363d; box-shadow: 0 8px 28px rgb(0 0 0 / 28%); }
.dark .markdown-body .markdown-code-toolbar { border-color: #30363d; background: #161b22; }
.dark .markdown-body pre { color: #c9d1d9; }
.dark .markdown-body .hljs-comment, .dark .markdown-body .hljs-quote { color: #8b949e; }
.dark .markdown-body .hljs-keyword, .dark .markdown-body .hljs-selector-tag, .dark .markdown-body .hljs-literal { color: #ff7b72; }
.dark .markdown-body .hljs-string, .dark .markdown-body .hljs-doctag, .dark .markdown-body .hljs-regexp { color: #a5d6ff; }
.dark .markdown-body .hljs-title, .dark .markdown-body .hljs-section, .dark .markdown-body .hljs-name { color: #d2a8ff; }
.dark .markdown-body .hljs-number, .dark .markdown-body .hljs-symbol, .dark .markdown-body .hljs-bullet { color: #79c0ff; }
.dark .markdown-body .hljs-attr, .dark .markdown-body .hljs-attribute, .dark .markdown-body .hljs-variable, .dark .markdown-body .hljs-template-variable { color: #ffa657; }
.dark .markdown-body .hljs-built_in, .dark .markdown-body .hljs-type, .dark .markdown-body .hljs-meta { color: #7ee787; }
.markdown-body hr { border: 0; border-top: 1px solid var(--border); margin: 2rem 0; }
.markdown-body .footnotes { border-top: 1px solid var(--border); margin-top: 2rem; padding-top: 1rem; color: var(--muted-foreground); font-size: .875rem; }
.markdown-body .footnotes ol { padding-left: 1.25rem; }
.markdown-body .footnote-backref { text-decoration: none; }
</style>
