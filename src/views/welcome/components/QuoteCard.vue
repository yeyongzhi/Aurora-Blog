<script setup lang="ts" name="QuoteCard">
import { computed, onMounted } from 'vue'
import { CopyIcon, MessageSquareQuoteIcon, RefreshCwIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Tooltip from '@/components/self/Tooltip/index.vue'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useQuote } from '@/composables/useQuote'
import message from '@/plugins/message'

const { quote, loading, fetchQuote } = useQuote()

const source = computed(() => {
    if (!quote.value) return ''
    const parts = [quote.value.from]
    if (quote.value.from_who) parts.push(`— ${quote.value.from_who}`)
    return parts.join(' · ')
})

const copyText = async (text: string) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()

    try {
        if (!document.execCommand('copy')) {
            throw new Error('Copy command failed')
        }
    } finally {
        document.body.removeChild(textarea)
    }
}

const copyQuote = async () => {
    if (!quote.value) {
        message.warning('暂无可复制内容')
        return
    }

    const content = source.value
        ? `${quote.value.hitokoto}\n——${source.value}`
        : quote.value.hitokoto

    try {
        await copyText(content)
        message.success('复制成功')
    } catch {
        message.error('复制失败，请重试')
    }
}

onMounted(() => {
    fetchQuote()
})
</script>

<template>
    <Card class="rounded-lg">
        <CardHeader>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <MessageSquareQuoteIcon class="size-4" />
                        随机一言
                    </CardTitle>
                    <CardDescription>
                        字里行间，遇见时光
                    </CardDescription>
                </div>
                <div class="flex items-center gap-x-2">
                    <Tooltip :content="quote ? '复制' : '暂无可复制内容'">
                        <Button variant="outline" size="icon-sm" @click="copyQuote()">
                            <CopyIcon class="size-4" />
                        </Button>
                    </Tooltip>
                    <Button variant="outline" size="icon-sm" :disabled="loading" @click="fetchQuote()">
                        <RefreshCwIcon :class="`size-4 ${loading ? 'animate-spin' : ''}`" />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div v-if="loading && !quote" class="py-4 text-center text-sm text-muted-foreground">
                正在寻找一句话…
            </div>
            <div v-else-if="quote" class="flex flex-col items-center gap-3 py-2 text-center">
                <p class="text-base leading-relaxed tracking-wide">
                    {{ quote.hitokoto }}
                </p>
                <span class="text-xs text-muted-foreground">{{ source }}</span>
            </div>
        </CardContent>
    </Card>
</template>
