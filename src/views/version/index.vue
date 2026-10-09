<script setup lang="ts" name="Version">
import { ref, onMounted } from 'vue'
import Loading from '@/components/self/Loading/index.vue'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getFetchData } from '@/utils'

interface VersionItem {
    version: string
    description?: string
    date: string
    content: { type: string; text: string }[]
}

const loading = ref(true)
const error = ref('')
const versionList = ref<VersionItem[]>([])
const loadVersions = async () => {
    loading.value = true
    error.value = ''
    try {
        const data = await getFetchData('/app/version.json')
        if (!Array.isArray(data) || !data.every(item => typeof item?.version === 'string' && typeof item.date === 'string' && Array.isArray(item.content) && item.content.every((entry: { text?: unknown } | null) => typeof entry?.text === 'string'))) {
            throw new Error('版本数据格式错误')
        }
        versionList.value = data
    } catch {
        error.value = '版本记录加载失败，请稍后重试'
    } finally {
        loading.value = false
    }
}
onMounted(loadVersions)
</script>

<template>
    <div class="h-full w-full overflow-hidden p-2 sm:p-4">
        <Loading v-if="loading" description="版本记录加载中..." />
        <div v-else-if="error" role="alert" class="flex flex-col items-center gap-3 p-6">
            <p>{{ error }}</p>
            <Button variant="outline" @click="loadVersions">重试</Button>
        </div>
        <ScrollArea v-else class="h-full">
            <div class="mx-auto w-full max-w-4xl pr-3">
                <div class="mb-4">
                    <h1 class="text-lg font-bold">版本更新记录【共 {{ versionList.length }} 条】</h1>
                    <p class="text-sm text-muted-foreground">记录每一次功能迭代与体验改进。</p>
                </div>
                <Card v-for="item in versionList" :key="item.version" class="mb-4 gap-2 py-4">
                    <CardHeader>
                        <CardTitle>V {{ item.version }}</CardTitle>
                        <CardDescription>发布日期：{{ item.date }}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p v-if="item.description" class="mb-2">{{ item.description }}</p>
                        <ul class="ml-4 list-disc text-sm leading-relaxed [&>li]:mt-2">
                            <li v-for="(entry, index) in item.content" :key="index">{{ entry.text }}</li>
                        </ul>
                    </CardContent>
                </Card>
                <p v-if="!versionList.length" role="status" class="py-8 text-center text-muted-foreground">暂无版本记录</p>
            </div>
        </ScrollArea>
    </div>
</template>
