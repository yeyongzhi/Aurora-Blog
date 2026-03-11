<script setup lang="ts" name="ToolBox">
import { ref, onMounted, watch, computed } from 'vue'
import Loading from '@/components/self/Loading/index.vue'
import Empty from '@/components/self/Empty/index.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/card'
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import NavItem from '@/views/nav/components/NavItem.vue'
import type { ToolBoxItem } from '@/types/ToolBox'
import { getFetchData } from '@/utils/index'

const tabs = ref<Array<{
    label: string
    key: string
}>>([])
const tabKey = ref<string>("")

onMounted(async () => {
    try {
        const data = await getFetchData('/toolbox/index.json')
        tabs.value = data
        if (tabs.value.length > 0) {
            tabKey.value = (tabs.value[0] as any).key
        }
    } catch (error) {
        console.error('获取工具盒子分类失败:', error)
    }
})

const content = ref<Record<string, Array<ToolBoxItem>>>({})
const contentLoading = ref(false)

const showContent = computed(() => {
    return content.value[tabKey.value] || []
})

const getTabContent = async (key: string) => {
    contentLoading.value = true
    try {
        const data = await getFetchData(`/toolbox/${key}.json`)
        content.value[key] = data || []
    } catch (error) {
        console.error(`获取工具盒子${key}分类失败:`, error)
    } finally {
        contentLoading.value = false
    }
}

watch(tabKey, (newKey) => {
    if (newKey && newKey !== "") {
        getTabContent(newKey)
    }
})

</script>

<template>
    <div class="w-full h-full p-4 flex flex-col">
        <Tabs v-model="tabKey" class="mb-4">
            <TabsList>
                <TabsTrigger v-for="tab in tabs" :key="tab.key" :value="tab.key">
                    {{ tab.label }}
                </TabsTrigger>
            </TabsList>
        </Tabs>
        <div class="flex-1 w-full justify-center items-center overflow-hidden">
            <Loading class="w-full h-full" description="加载中..." v-if="contentLoading" />
            <template v-else>
                <Empty v-if="showContent.length === 0"></Empty>
                <ScrollArea class="w-full h-full" v-else>
                    <Card v-for="item in showContent" :key="item.title" class="gap-4 py-4 mb-8">
                        <CardHeader>
                            <CardTitle class="flex text-2xl items-center">
                                {{ item.title }}
                            </CardTitle>
                            <CardDescription>
                                {{ item.descriptions }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="grid grid-cols-4 gap-4 my-4">
                                <div v-for="linkItem in item.children" :key="linkItem.name">
                                    <NavItem :data="linkItem" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ScrollArea>
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
