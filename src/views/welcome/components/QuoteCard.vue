<script setup lang="ts" name="QuoteCard">
import { computed, onMounted } from 'vue'
import { MessageSquareQuoteIcon, RefreshCwIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useQuote } from '@/composables/useQuote'

const { quote, loading, fetchQuote } = useQuote()

const source = computed(() => {
    if (!quote.value) return ''
    const parts = [quote.value.from]
    if (quote.value.from_who) parts.push(`— ${quote.value.from_who}`)
    return parts.join(' · ')
})

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
                <Button variant="outline" size="icon-sm" :disabled="loading" @click="fetchQuote()">
                    <RefreshCwIcon :class="`size-4 ${loading ? 'animate-spin' : ''}`" />
                </Button>
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
