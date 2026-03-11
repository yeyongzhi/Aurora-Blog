<script setup lang="ts" name="Nav">
import Loading from '@/components/self/Loading/index.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/card'
import NavItem from './components/NavItem.vue'
import { ref, onMounted } from 'vue'
import { getFetchData } from '@/utils/index'

export interface LinkItem {
    name: string;
    icon?: string;
    url: string;
    descriptions?: string;
    singleIcon?: boolean;
    textIcon?: string;
    iconWidth?: number;
    iconHeight?: number;
}

interface NavItem {
    title: string;
    descriptions?: string;
    linkList: Array<LinkItem>;
}

const navData = ref<Array<NavItem>>([])

onMounted(async () => {
    try {
        const data = await getFetchData('/nav.json')
        navData.value = data
    } catch (error) {
        console.error('获取导航栏数据失败:', error)
    }
})
</script>

<template>
    <ScrollArea class="w-full h-full p-4">
        <div class="w-full px-[15%]" v-if="navData && navData.length > 0">
            <Card v-for="navItem in navData" :key="navItem.title" class="gap-4 py-4 mb-8">
                <CardHeader>
                    <CardTitle class="flex text-2xl items-center">
                        {{ navItem.title }}
                    </CardTitle>
                    <CardDescription>
                        {{ navItem.descriptions }}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="grid grid-cols-3 gap-4 my-4">
                        <div v-for="linkItem in navItem.linkList" :key="linkItem.name">
                            <NavItem :data="linkItem" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <Loading description="加载中..." v-else />
    </ScrollArea>
</template>

<style scoped lang="scss"></style>
