<script setup lang="ts" name="DailyNews">
import { computed, onMounted } from 'vue'
import { NewspaperIcon, RefreshCwIcon, ImageIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Tooltip from '@/components/self/Tooltip/index.vue'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Item,
    ItemContent,
    ItemTitle,
    ItemMedia,
} from '@/components/ui/item'
import { useDailyNews } from '@/composables/useDailyNews'

const {
    newsData,
    loading,
    fetchNews,
    imageDialogOpen,
    imageUrl,
    openImageViewer,
    closeImageViewer,
} = useDailyNews()

const headerInfo = computed(() => {
    if (!newsData.value) return ''
    return `${newsData.value.date} ${newsData.value.day_of_week} · ${newsData.value.lunar_date}`
})

onMounted(() => {
    fetchNews()
})
</script>

<template>
    <Card class="h-full rounded-lg flex flex-col overflow-hidden">
        <CardHeader>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <NewspaperIcon class="size-4" />
                        每日60s新闻
                    </CardTitle>
                    <CardDescription>{{ headerInfo || '加载中…' }}</CardDescription>
                </div>
                <div class="flex items-center gap-2">
                    <Tooltip content="图片查看">
                        <Button variant="outline" size="icon-sm" @click="openImageViewer()">
                            <ImageIcon class="size-4" />
                        </Button>
                    </Tooltip>
                    <Button variant="outline" size="icon-sm" :disabled="loading" @click="fetchNews()">
                        <RefreshCwIcon :class="`size-4 ${loading ? 'animate-spin' : ''}`" />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0 overflow-hidden">
            <div v-if="loading && !newsData" class="flex items-center justify-center py-12">
                <span class="text-sm text-muted-foreground">正在加载新闻…</span>
            </div>
            <ScrollArea v-else-if="newsData" class="h-full">
                <div class="flex flex-col gap-y-4">
                    <Item v-for="(text, index) in newsData.news" :key="index" variant="outline">
                        <ItemMedia class="font-medium tabular-nums">
                            {{ String(index + 1).padStart(2, '0') }}
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle class="leading-relaxed">
                                {{ text }}
                            </ItemTitle>
                        </ItemContent>
                    </Item>
                </div>
                <p v-if="newsData.tip" class="mt-4 text-center text-xs text-muted-foreground italic">
                    {{ newsData.tip }}
                </p>
            </ScrollArea>
        </CardContent>
    </Card>

    <!-- 图片查看弹窗 -->
    <Dialog :open="imageDialogOpen" @update:open="closeImageViewer">
        <DialogContent class="max-w-2xl">
            <DialogHeader>
                <DialogTitle>每日60s新闻 - 图片版</DialogTitle>
            </DialogHeader>
            <div class="flex justify-center">
                <img
                    :src="imageUrl"
                    alt="每日60s新闻图片"
                    class="w-full rounded-md"
                    loading="lazy"
                />
            </div>
        </DialogContent>
    </Dialog>
</template>
