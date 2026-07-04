<script setup lang="ts" name="TodayPoetry">
import { onMounted } from 'vue'
import { BookOpenIcon, RefreshCwIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { usePoetry } from '@/composables/usePoetry'

const { poetry, loading, fetchPoetry } = usePoetry()

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
                <Button variant="outline" size="icon-sm" :disabled="loading" @click="fetchPoetry()">
                    <RefreshCwIcon :class="`size-4 ${loading ? 'animate-spin' : ''}`" />
                </Button>
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
