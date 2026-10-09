<script setup lang="ts" name="Header">
import { onUnmounted, ref } from 'vue'
import ArticleSearch from '@/components/self/ArticleSearch.vue'
import Menu from './components/Menu.vue'
import Avatar from './components/Avatar.vue'
import DateTime from './components/DateTime.vue'
import SystemSetting from './components/SystemSetting.vue'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { SunIcon, MoonIcon, Laptop, ClockIcon } from 'lucide-vue-next'
import useAppStore from '@/store/app'

const appStore = useAppStore()
const themeOpen = ref(false)
const timeOpen = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | undefined
const cancelClose = () => { clearTimeout(closeTimer) }
const openPanel = (panel: 'theme' | 'time') => {
    cancelClose()
    themeOpen.value = panel === 'theme'
    timeOpen.value = panel === 'time'
}
const scheduleClose = () => {
    cancelClose()
    closeTimer = setTimeout(() => { themeOpen.value = false; timeOpen.value = false }, 180)
}
onUnmounted(cancelClose)

</script>

<template>
    <div class="w-full min-h-[60px] shrink-0 flex-wrap gap-2 border-b px-2 sm:px-8 flex justify-between items-center">
        <Avatar />
        <div class="flex justify-center items-center gap-2 flex-wrap">
            <Menu />
            <ArticleSearch />
            <Popover v-model:open="themeOpen">
                <span class="inline-flex" @pointerenter="openPanel('theme')" @pointerleave="scheduleClose">
                    <PopoverTrigger as-child>
                    <Button size="icon" variant="outline" aria-label="主题模式">
                        <SunIcon />
                    </Button>
                </PopoverTrigger>
                </span>
                <PopoverContent class="w-fit p-2" align="center" @pointerenter="cancelClose" @pointerleave="scheduleClose">
                    <div class="flex flex-col justify-center items-center gap-y-2">
                        <Button size="sm" variant="outline" @click="appStore.handleModeChange(item.value as any)"
                            v-for="item in appStore.themeOptions" :key="item.value">
                            <SunIcon v-if="item.value === 'light'" />
                            <MoonIcon v-else-if="item.value === 'dark'" />
                            <Laptop v-else />
                            {{ item.label }}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
            <Popover v-model:open="timeOpen">
                <span class="inline-flex" @pointerenter="openPanel('time')" @pointerleave="scheduleClose">
                    <PopoverTrigger as-child>
                    <Button size="icon" variant="outline" aria-label="日期时间">
                        <ClockIcon />
                    </Button>
                </PopoverTrigger>
                </span>
                <PopoverContent class="w-fit p-2" align="end" @pointerenter="cancelClose" @pointerleave="scheduleClose">
                    <p class="mb-2 text-sm">当前日期时间</p>
                    <DateTime />
                </PopoverContent>
            </Popover>
            <SystemSetting />
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
