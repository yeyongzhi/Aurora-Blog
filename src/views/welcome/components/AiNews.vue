<script setup lang="ts" name="AiNews">
import { computed, onMounted } from 'vue'
import { BotIcon, ExternalLinkIcon, RefreshCwIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item'
import { useDailyNews } from '@/composables/useDailyNews'

/** 22 点之后取当天数据，否则取昨天 */
const getTargetDate = (): string => {
    const now = new Date()
    const hour = now.getHours()
    const target = hour >= 22 ? now : new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const y = target.getFullYear()
    const m = String(target.getMonth() + 1).padStart(2, '0')
    const d = String(target.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const { aiNewsData, loading, fetchNews } = useDailyNews('ai-news')

const headerInfo = computed(() => {
    if (!aiNewsData.value) return ''
    return `${aiNewsData.value.date} · 数据当天22:00后更新`
})

const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
    const date = getTargetDate()
    fetchNews(date)
})
</script>

<template>
    <Card class="h-full rounded-lg flex flex-col overflow-hidden">
        <CardHeader>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <BotIcon class="size-4" />
                        AI 资讯快报
                    </CardTitle>
                    <CardDescription>{{ headerInfo || '加载中…' }}</CardDescription>
                </div>
                <Button variant="outline" size="icon-sm" :disabled="loading" @click="fetchNews(getTargetDate())">
                    <RefreshCwIcon :class="`size-4 ${loading ? 'animate-spin' : ''}`" />
                </Button>
            </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0 overflow-hidden">
            <div v-if="loading && !aiNewsData" class="flex items-center justify-center py-12">
                <span class="text-sm text-muted-foreground">正在加载 AI 资讯…</span>
            </div>
            <ScrollArea v-else-if="aiNewsData" class="h-full">
                <div class="flex flex-col gap-y-4">
                    <Item v-for="(item, index) in aiNewsData.news" :key="index" variant="outline">
                        <ItemMedia class="font-medium text-muted-foreground tabular-nums">
                            {{ String(index + 1).padStart(2, '0') }}
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle class="text-sm font-semibold">
                                {{ item.title }}
                            </ItemTitle>
                            <ItemDescription class="mt-1 leading-relaxed">
                                {{ item.detail }}
                            </ItemDescription>
                            <Badge variant="secondary" class="mt-2 text-xs">
                                {{ item.source }}
                            </Badge>
                        </ItemContent>
                        <ItemActions>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                @click="openLink(item.link)"
                            >
                                <ExternalLinkIcon class="size-4" />
                            </Button>
                        </ItemActions>
                    </Item>
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
</template>
