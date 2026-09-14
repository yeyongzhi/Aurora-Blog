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
    loading.value = Boolean(path)
    if (!path) { clearTimeout(timeout); return }
    try {
        const [{ content, lastModified: modified }, articles] = await Promise.all([getMarkDownData(path, controller.signal), readCatalog()])
        if (!active) return
        if (content === null) throw new Error('文章加载失败，请检查网络或文章路径')
        documentData.value = renderMarkdown(content, { articlePath: path, base: import.meta.env.BASE_URL, highlight })
        const article = documentData.value
        document.title = article.title ? `${article.title} · Aurora Blog` : 'Aurora Blog'
        for (const name of ['description', 'og:description']) document.querySelector(`meta[${name.startsWith('og:') ? 'property' : 'name'}="${name}"]`)?.setAttribute('content', article.summary)
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', article.title || 'Aurora Blog')
        const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
        if (canonical) {
            const route = path.replace(/^\/?article\//, '').replace(/\.md$/, '').split('/').map(encodeURIComponent).join('/')
            canonical.href = new URL(`${import.meta.env.BASE_URL}${route}/`, canonical.href).href
            document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical.href)
        }
        const metadata = articles.find(item => `article/${item.path}.md` === path.replace(/^\//, ''))
        if (metadata) { published.value = dayjs(metadata.published).format('YYYY-MM-DD'); dateSource.value = metadata.dateSource }
        for (const [property, content] of [['article:published_time', metadata?.published], ['article:modified_time', metadata?.updated], ['og:type', 'article']]) {
            let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
            if (content) { if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property!); document.head.append(tag) } tag.content = content }
            else tag?.remove()
        }
        let schema = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]')
        if (!schema) { schema = document.createElement('script'); schema.type = 'application/ld+json'; document.head.append(schema) }
        schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title, description: article.summary, ...(metadata ? { datePublished: metadata.published, dateModified: metadata.updated } : {}), author: { '@type': 'Person', name: 'Aurora' } })
        const updated = metadata?.updated || modified
        if (updated) lastModified.value = dayjs(updated).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
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
        <Loading v-if="loading" description="文章加载中..." />
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
.markdown-body { overflow-wrap: anywhere; line-height: 1.8; }
.markdown-body h1 { font-size: 2.25rem; font-weight: 800; margin: 0 0 1rem; line-height: 1.3; }
.markdown-body h2 { font-size: 1.875rem; font-weight: 700; margin: 1.5rem 0 1rem; line-height: 1.4; }
.markdown-body h3 { font-size: 1.5rem; font-weight: 600; margin: 1.25rem 0 .75rem; }
.markdown-body h4, .markdown-body h5, .markdown-body h6 { font-size: 1.125rem; font-weight: 600; margin: 1rem 0 .5rem; }
.markdown-body p { margin: .75rem 0; }
.markdown-body ul { list-style: disc; padding-left: 1.5rem; margin: .5rem 0; }
.markdown-body ol { list-style: decimal; padding-left: 1.5rem; margin: .5rem 0; }
.markdown-body .contains-task-list { list-style: none; }
.markdown-body input[type=checkbox] { margin-right: .5rem; }
.markdown-body blockquote { border-left: 4px solid var(--border); padding-left: 1rem; margin: 1rem 0; color: var(--muted-foreground); }
.markdown-body a { text-decoration: underline; text-underline-offset: 3px; }
.markdown-body img { max-width: 100%; height: auto; border-radius: .5rem; }
.markdown-body .markdown-table { overflow-x: auto; margin: 1rem 0; }
.markdown-body table { border-collapse: collapse; width: 100%; }
.markdown-body th, .markdown-body td { border: 1px solid var(--border); padding: .5rem .75rem; min-width: 6rem; }
.markdown-body th { background: var(--muted); font-weight: 600; }
.markdown-body .markdown-code { margin: 1rem 0; border: 1px solid var(--border); border-radius: .5rem; overflow: hidden; background: var(--muted); }
.markdown-body .markdown-code-toolbar { display: flex; align-items: center; justify-content: space-between; padding: .5rem .75rem; border-bottom: 1px solid var(--border); font-size: .75rem; }
.markdown-body button[data-copy-code] { cursor: pointer; padding: .25rem .5rem; border-radius: .25rem; background: var(--secondary); color: var(--secondary-foreground); }
.markdown-body button[data-copy-code]:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
.markdown-body pre { overflow-x: auto; white-space: pre; padding: 1rem; font-size: .875rem; line-height: 1.6; }
.markdown-body :not(pre) > code { border-radius: .25rem; background: var(--muted); padding: .15rem .3rem; font-size: .9em; }
.markdown-body .hljs-keyword, .markdown-body .hljs-title { font-weight: 700; }
.markdown-body .hljs-comment, .markdown-body .hljs-string { color: var(--muted-foreground); }
.markdown-body hr { border-top: 1px solid var(--border); margin: 1.5rem 0; }
.markdown-body .footnotes { border-top: 1px solid var(--border); margin-top: 2rem; padding-top: 1rem; font-size: .875rem; }
</style>
