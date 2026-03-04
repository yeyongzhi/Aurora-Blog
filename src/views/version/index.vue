<script setup lang="ts" name="Version">
import { ref, onMounted } from 'vue'
import Loading from '@/components/self/Loading/index.vue'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserIcon, BoxIcon, PhoneCallIcon, CpuIcon } from 'lucide-vue-next';

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

        const response = await fetch('/app/version.json')
        const data = await response.json()
        versionList.value = data
    } catch (error) {
        console.error('获取版本信息失败:', error)
    } finally {
        loading.value = false
    }
})



</script>

<template>
    <div class="w-full p-4 overflow-hidden">
        <div v-if="loading" class="w-full h-full flex items-center justify-center">
            <Loading />
        </div>
        <ScrollArea class="w-[50%]" v-else>
            <Card v-for="item in versionList" :key="item.version" class="gap-2 py-4">
                <CardHeader>
                    <CardTitle class="flex text-lg items-center">
                        <span>V {{ item.version }}</span>
                    </CardTitle>
                    <CardDescription>
                        {{ item.description }}
                    </CardDescription>
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
