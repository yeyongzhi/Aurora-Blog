<script setup lang="ts" name="FeaturedContent">
import { onMounted, ref } from 'vue'
import { ArrowUpRightIcon, SparklesIcon } from 'lucide-vue-next'
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
import { getFetchData, getMdPath, openTab } from '@/utils'
import { type NoteTreeItem } from '@/types/Note'

interface FeaturedArticle {
    id: string
    title: string
    path: string
}

interface FavoriteNode {
    node: NoteTreeItem
    path: string[]
}

const featuredList = ref<FeaturedArticle[]>([])

/** 递归遍历 note 树，收集所有 favorite: true 的节点及其路径 */
const collectFavoriteNodes = (tree: NoteTreeItem[], parentPath: string[] = []): FavoriteNode[] => {
    const results: FavoriteNode[] = []
    for (const item of tree) {
        const currentPath = [...parentPath, item.key]
        if (item.favorite) {
            results.push({ node: item, path: currentPath })
        }
        if (item.children && item.children.length > 0) {
            results.push(...collectFavoriteNodes(item.children, currentPath))
        }
    }
    return results
}

const getFeaturedData = async () => {
    const noteTree = await getFetchData('/note.json') as NoteTreeItem[]
    const favorites = collectFavoriteNodes(noteTree)

    featuredList.value = favorites.map(({ node, path }) => ({
        id: node.key,
        title: node.label,
        path: getMdPath('/article/note', path.join('/')),
    }))
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
                        精选内容
                    </CardTitle>
                    <CardDescription>精挑细选的知识沉淀，愿它们也能点亮你的灵感。</CardDescription>
                </div>
                <Badge variant="secondary">共{{ featuredList.length }}篇文章</Badge>
            </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0 overflow-hidden">
            <ScrollArea class="h-full">
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
                                <Button variant="outline" size="icon-sm" @click="openTab(item.path)">
                                    <ArrowUpRightIcon class="size-4" />
                                </Button>
                            </ItemActions>
                        </Item>
                    </div>
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
</template>
