<script setup lang="ts" name="FeaturedContent">
import { computed, onMounted, ref } from 'vue'
import { ArrowUpRightIcon, SparklesIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { findTreeNode, findTreePath, getFetchData, getMdPath, openTab } from '@/utils'
import { type NoteTreeItem } from '@/types/Note'

interface FeaturedConfig {
    id: string
}

interface FeaturedArticle {
    id: string
    title: string
    path: string
}

const featuredList = ref<FeaturedArticle[]>([])
const featuredLoading = ref(false)
const featuredError = ref('')

const showFeaturedList = computed(() => featuredList.value.slice(0, 4))

const getFeaturedData = async () => {
    featuredLoading.value = true
    featuredError.value = ''

    try {
        const [featuredConfig, noteTree] = await Promise.all([
            getFetchData('/article/featured.json') as Promise<FeaturedConfig[]>,
            getFetchData('/note.json') as Promise<NoteTreeItem[]>,
        ])

        featuredList.value = featuredConfig.map((item) => {
            const notePath = findTreePath(noteTree, item.id)
            const noteItem = findTreeNode(noteTree, item.id)

            return {
                id: item.id,
                title: noteItem?.label || item.id,
                path: notePath ? getMdPath('/article/note', notePath.join('/')) : '',
            }
        }).filter((item) => item.path)
    } catch (error) {
        featuredError.value = error instanceof Error ? error.message : '精选内容获取失败'
    } finally {
        featuredLoading.value = false
    }
}

onMounted(() => {
    getFeaturedData()
})
</script>

<template>
    <Card class="h-full rounded-lg">
        <CardHeader>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <SparklesIcon class="size-4" />
                        精选内容
                    </CardTitle>
                </div>
                <span class="text-sm text-muted-foreground">{{ featuredLoading ? '加载中' : `${featuredList.length} 篇` }}</span>
            </div>
        </CardHeader>
        <CardContent class="grid gap-4">
            <div v-if="featuredError" class="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {{ featuredError }}
            </div>
            <div v-else-if="featuredLoading" class="grid gap-3">
                <div v-for="item in 3" :key="item" class="h-24 rounded-lg bg-muted" />
            </div>
            <div v-else class="grid gap-3">
                <div v-for="item in showFeaturedList" :key="item.path" class="rounded-lg border p-4">
                    <div class="flex items-center justify-between gap-4">
                        <div class="min-w-0">
                            <h3 class="truncate font-semibold">{{ item.title }}</h3>
                            <p class="mt-1 truncate text-sm text-muted-foreground">{{ item.path }}</p>
                        </div>
                        <Button variant="outline" size="icon-sm" @click="openTab(item.path)">
                            <ArrowUpRightIcon class="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
