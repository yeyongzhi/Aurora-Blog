<script setup lang="ts" name="FeaturedContent">
import { onMounted, ref } from 'vue'
import { ArrowUpRightIcon, SparklesIcon } from 'lucide-vue-next'
import Tooltip from '@/components/self/Tooltip/index.vue'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@/components/ui/item'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getFetchData } from '@/utils'
import { type NoteTreeItem } from '@/types/Note'
import useAppStore from '@/store/app'
import { isArticleTree, publishedTree } from '@/utils/articleTree'
import { getPathFromKey } from '@/router/urlSync'

interface FeaturedArticle {
    id: string
    title: string
    path: string      // 展示用的 .md 文件路径
    treePath: string  // 导航用的文章树路径
}

interface FavoriteNode {
    node: NoteTreeItem
    path: string[]
}

const appStore = useAppStore()
const featuredList = ref<FeaturedArticle[]>([])
const loading = ref(false)
const error = ref('')

/** 递归遍历 note 树，收集所有 favorite: true 的节点及其路径 */
const collectFavoriteNodes = (tree: NoteTreeItem[], parentPath: string[] = []): FavoriteNode[] => {
    const results: FavoriteNode[] = []
    for (const item of tree) {
        const currentPath = [...parentPath, item.key]
        if (item.favorite && !item.children?.length) {
            results.push({ node: item, path: currentPath })
        }
        if (item.children && item.children.length > 0) {
            results.push(...collectFavoriteNodes(item.children, currentPath))
        }
    }
    return results
}

const getFeaturedData = async () => {
    loading.value = true
    error.value = ''
    try {
        const noteTree: unknown = await getFetchData('/note.json')
        if (!isArticleTree(noteTree)) throw new Error('文章目录格式无效')
        const favorites = collectFavoriteNodes(publishedTree(noteTree))

        featuredList.value = favorites.map(({ node, path }) => {
            const treePath = path.join('/')
            return {
                id: node.key,
                title: node.label,
                path: `/article/note/${treePath}.md`,
                treePath,
            }
        })
    } catch {
        error.value = '精选内容加载失败，请稍后重试'
    } finally {
        loading.value = false
    }
}

/** 在应用内导航到笔记文章（深层链接） */
const goToNoteArticle = (treePath: string) => {
    appStore.menuKey = 'note'
    appStore.articlePath = treePath
    window.history.pushState(
        { key: 'note', articlePath: treePath },
        '',
        getPathFromKey('note', treePath),
    )
}

onMounted(() => {
    getFeaturedData()
})
</script>

<template>
    <Card class="h-full rounded-lg flex flex-col overflow-hidden">
        <CardHeader>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <SparklesIcon class="size-4" />
                        精选内容🔥
                    </CardTitle>
                    <CardDescription>精挑细选的知识沉淀，愿它们也能点亮你的灵感。</CardDescription>
                </div>
                <Badge variant="secondary">共{{ featuredList.length }}篇文章</Badge>
            </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0 overflow-hidden">
            <p v-if="loading" role="status" class="text-sm text-muted-foreground">精选内容加载中...</p>
            <div v-else-if="error" role="alert" class="flex flex-col gap-3"><p>{{ error }}</p><Button variant="outline" @click="getFeaturedData">重试</Button></div>
            <p v-else-if="!featuredList.length" role="status" class="text-sm text-muted-foreground">暂无精选文章</p>
            <ScrollArea v-else class="h-full">
                <div class="flex flex-col gap-y-4">
                    <div v-for="item in featuredList" :key="item.path">
                        <Item variant="outline">
                            <ItemContent>
                                <ItemTitle class="font-semibold">{{ item.title }}</ItemTitle>
                                <ItemDescription>
                                    {{ item.path }}
                                </ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Tooltip :content="'阅读：' + item.title"><Button :aria-label="'阅读：' + item.title" variant="outline" size="icon-sm" @click="goToNoteArticle(item.treePath)">
                                    <ArrowUpRightIcon class="size-4" />
                                </Button></Tooltip>
                            </ItemActions>
                        </Item>
                    </div>
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
</template>
