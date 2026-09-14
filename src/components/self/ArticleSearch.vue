<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SearchIcon } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchJson } from '@/utils/request'
import { searchArticles, type SearchArticle } from '@/utils/search'
import useAppStore from '@/store/app'
const store = useAppStore(), open = ref(false), query = ref(''), articles = ref<SearchArticle[]>([]), loading = ref(false), error = ref('')
const load = async () => {
    if (articles.value.length) return
    loading.value = true; error.value = ''
    try { articles.value = await fetchJson<SearchArticle[]>(`${import.meta.env.BASE_URL}article-index.json`, AbortSignal.timeout(15000)) }
    catch { error.value = '搜索索引加载失败，请重试' }
    finally { loading.value = false }
}
watch(open, value => { if (value) void load() })
const results = computed(() => searchArticles(articles.value, query.value))
const navigate = (article: SearchArticle) => {
    const [page, ...parts] = article.path.split('/')
    store.handleMenuChange(page!); store.handleArticleChange(parts.join('/')); open.value = false
}
</script>
<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child><Button size="icon" variant="outline" aria-label="搜索文章"><SearchIcon /></Button></DialogTrigger>
        <DialogContent class="sm:max-w-xl">
            <DialogHeader><DialogTitle>搜索文章</DialogTitle><DialogDescription>搜索标题与全文，多个关键词用空格分隔。</DialogDescription></DialogHeader>
            <label for="article-search" class="sr-only">搜索关键词</label><Input id="article-search" v-model="query" placeholder="输入关键词，例如 Vue 状态管理" />
            <p v-if="loading" role="status">索引加载中...</p>
            <div v-else-if="error" role="alert">{{ error }} <Button variant="outline" @click="load">重试</Button></div>
            <p v-else-if="!query.trim()" class="text-sm text-muted-foreground">共 {{ articles.length }} 篇文章，输入关键词开始搜索。</p>
            <p v-else role="status" class="text-sm text-muted-foreground">找到 {{ results.length }} 篇文章</p>
            <ul class="max-h-[55dvh] overflow-auto flex flex-col gap-2">
                <li v-for="article in results.slice(0, 50)" :key="article.path"><button type="button" class="w-full text-left rounded-md border p-3 hover:bg-accent focus-visible:outline-ring" @click="navigate(article)"><strong>{{ article.title }}</strong><p class="text-xs text-muted-foreground">{{ article.path }}</p><p class="mt-1 text-sm line-clamp-2">{{ article.summary }}</p></button></li>
            </ul>
            <p v-if="results.length > 50" class="text-xs text-muted-foreground">显示前 50 项，请增加关键词缩小范围。</p>
        </DialogContent>
    </Dialog>
</template>
