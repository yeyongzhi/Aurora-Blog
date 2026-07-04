<script setup lang="ts" name="TodayInHistory">
import { computed, onMounted } from 'vue'
import { CalendarClockIcon, ExternalLinkIcon, RefreshCwIcon } from 'lucide-vue-next'
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
import { useHistory } from '@/composables/useHistory'

const { historyData, loading, fetchHistory, getEventLabel } = useHistory()

const eventBadgeVariant = (type: string): 'default' | 'secondary' | 'outline' => {
    switch (type) {
        case 'birth':
            return 'default'
        case 'death':
            return 'secondary'
        case 'event':
            return 'outline'
        default:
            return 'secondary'
    }
}

const headerInfo = computed(() => {
    if (!historyData.value) return ''
    return `${historyData.value.month} 月 ${historyData.value.day} 日`
})

const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
    fetchHistory()
})
</script>

<template>
    <Card class="h-full rounded-lg flex flex-col overflow-hidden">
        <CardHeader>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <CalendarClockIcon class="size-4" />
                        历史上的今天
                    </CardTitle>
                    <CardDescription>
                        {{ headerInfo }}
                        <Badge variant="secondary">共 {{ historyData ? historyData.items.length : '-' }} 条</Badge>
                    </CardDescription>
                </div>
                <Button variant="outline" size="icon-sm" :disabled="loading" @click="fetchHistory()">
                    <RefreshCwIcon :class="`size-4 ${loading ? 'animate-spin' : ''}`" />
                </Button>
            </div>
        </CardHeader>
        <CardContent class="flex-1 min-h-0 overflow-hidden">
            <div v-if="loading && !historyData" class="flex items-center justify-center py-12">
                <span class="text-sm text-muted-foreground">正在加载历史…</span>
            </div>
            <ScrollArea v-else-if="historyData" class="h-full">
                <div class="flex flex-col gap-y-4">
                    <Item
                        v-for="item in historyData.items"
                        :key="item.link"
                        variant="outline"
                    >
                        <ItemMedia class="shrink-0 text-center">
                            <span class="block text-sm font-bold tabular-nums text-muted-foreground">
                                {{ item.year }}
                            </span>
                        </ItemMedia>
                        <ItemContent>
                            <div class="flex items-center gap-2">
                                <ItemTitle class="text-sm font-semibold">
                                    {{ item.title }}
                                </ItemTitle>
                                <Badge :variant="eventBadgeVariant(item.event_type)" class="shrink-0 text-xs">
                                    {{ getEventLabel(item.event_type) }}
                                </Badge>
                            </div>
                            <ItemDescription class="mt-1 line-clamp-2 leading-relaxed">
                                {{ item.description }}
                            </ItemDescription>
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
