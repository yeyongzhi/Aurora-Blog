<script setup lang="ts" name="Version">
import { ref, onMounted } from 'vue'
import Loading from '@/components/self/Loading/index.vue'
import Icon from '@/components/self/Icon/index.vue'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
    CardAction
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFetchData } from '@/utils/index'

interface VersionContentItem {
    type: string;
    text: string;
}

interface VersionItem {
    type: string;
    version: string;
    description: string;
    date: string;
    content: VersionContentItem[];
}

const loading = ref(true)
const versionList = ref<Array<VersionItem>>([])

onMounted(async () => {
    try {
        const data = await getFetchData('/app/version.json')
        versionList.value = data
    } catch (error) {
        console.error('获取版本信息失败:', error)
    } finally {
        loading.value = false
    }
})



</script>

<template>
    <div class="w-full h-full p-4 overflow-hidden">
        <div v-if="loading" class="w-full h-full flex items-center justify-center">
            <Loading />
        </div>
        <ScrollArea class="pr-[50%] h-full" v-else>
            <div class="mb-4">
                <p class="text-lg font-bold ">版本更新记录 【共{{ versionList.length }}条】</p>
                <p class="text-sm text-gray-500">有这个显得我比较专业，知豆不？</p>
            </div>
            <Card v-for="item in versionList" :key="item.version" class="gap-2 py-4">
                <CardHeader>
                    <CardTitle class="flex text-lg items-center">
                        <span>V {{ item.version }}</span>
                    </CardTitle>
                    <CardDescription>
                        {{ item.description }}
                    </CardDescription>
                    <CardAction>
                        <Icon name="FileCodeCornerIcon" background size="6" v-if="item.type === 'feature'" />
                        <Icon name="BugIcon" background size="6" v-else-if="item.type === 'fix'" />
                        <Icon name="HammerIcon" background size="6" v-else-if="item.type === 'refactor'" />
                        <Icon name="MonitorIcon" background size="6" v-else />
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <ul class="ml-4 list-disc [&>li]:mt-2">
                        <li v-for="(desc, dIndex) in item.content" :key="dIndex">{{ desc.text }}</li>
                    </ul>
                </CardContent>
            </Card>
        </ScrollArea>
    </div>
</template>

<style scoped lang="scss"></style>
