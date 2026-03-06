<script setup lang="ts" name="ToolBox">
import { ref, onMounted } from 'vue'
import Loading from '@/components/self/Loading/index.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/card'
import NavItem from '@/views/nav/components/NavItem.vue'
import type { NavItem as NavItemType } from '@/types/Nav'

const navData = ref<Array<NavItemType>>([])

onMounted(() => {
    fetch('/nav.json')
        .then(response => response.json())
        .then(data => {
            navData.value = data
        })
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
