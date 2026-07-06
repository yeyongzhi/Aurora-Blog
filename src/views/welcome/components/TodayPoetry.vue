<script setup lang="ts" name="TodayPoetry">
import { onMounted } from 'vue'
import { BookOpenIcon, RefreshCwIcon, CopyIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Tooltip from '@/components/self/Tooltip/index.vue'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { usePoetry } from '@/composables/usePoetry'
import message from '@/plugins/message'

const { poetry, loading, fetchPoetry } = usePoetry()

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

const copyPoetry = async () => {
    if (!poetry.value) {
        message.warning('暂无可复制内容')
        return
    }

    const content = `${poetry.value.content}\n——${poetry.value.author}《${poetry.value.origin}》`

    try {
        await copyText(content)
        message.success('复制成功')
    } catch {
        message.error('复制失败，请重试')
    }
}

onMounted(() => {
    fetchPoetry()
})
</script>

<template>
    <Card class="rounded-lg">
        <CardHeader>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <BookOpenIcon class="size-4" />
                        今日诗词
                    </CardTitle>
                    <CardDescription>随机推荐一首古诗词，品味千年文韵</CardDescription>
                </div>
                <div class="flex items-center gap-x-2">
                    <Tooltip :content="poetry ? '复制' : '暂无可复制内容'">
                        <Button variant="outline" size="icon-sm" @click="copyPoetry()">
                            <CopyIcon class="size-4" />
                        </Button>
                    </Tooltip>
                    <Button variant="outline" size="icon-sm" :disabled="loading" @click="fetchPoetry()">
                        <RefreshCwIcon :class="`size-4 ${loading ? 'animate-spin' : ''}`" />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div v-if="loading && !poetry" class="flex items-center justify-center py-8">
                <span class="text-sm text-muted-foreground">正在寻一首好诗…</span>
            </div>
            <div v-else-if="poetry" class="flex flex-col items-center gap-3 py-4 text-center">
                <p class="text-lg leading-relaxed tracking-wide">
                    {{ poetry.content }}
                </p>
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>——</span>
                    <span class="font-medium">{{ poetry.author }}</span>
                    <span>《{{ poetry.origin }}》</span>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
