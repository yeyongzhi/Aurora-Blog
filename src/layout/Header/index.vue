<script setup lang="ts" name="Header">
import Menu from './components/Menu.vue'
import Avatar from './components/Avatar.vue'
import DateTime from './components/DateTime.vue'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { SunIcon, MoonIcon, Laptop, Settings, ClockIcon } from 'lucide-vue-next'
import themeColorData from '@/style/themeColor.json'
import useAppStore from '@/store/app'

const appStore = useAppStore()

</script>

<template>
    <div class="w-full h-[60px] border-b px-8 flex justify-between items-center">
        <div>
            <Avatar />
        </div>
        <div class="flex justify-center items-center gap-x-4">
            <Menu />
            
            <Popover>
                <PopoverTrigger asChild>
                    <Button size="icon" variant="outline">
                        <SunIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-fit p-2" align="center">
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
            <Popover>
                <PopoverTrigger asChild>
                    <Button size="icon" variant="outline">
                        <ClockIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-fit p-2" align="end">
                    <p class="mb-2">当前日期时间</p>
                    <DateTime />
                </PopoverContent>
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button size="icon" variant="outline">
                        <Settings />
                    </Button>
                </PopoverTrigger>
                <PopoverContent class="w-fit p-2" align="end">
                    <p class="mb-2">主题颜色</p>
                    <div class="w-60">
                        <div class="w-full flex flex-wrap gap-2">
                            <Button class="w-29 flex items-center justify-between gap-x-2" size="sm" variant="outline"
                                v-for="item in themeColorData" :key="item.color">
                                <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: item.color }"></div>
                                {{ item.name }}
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
