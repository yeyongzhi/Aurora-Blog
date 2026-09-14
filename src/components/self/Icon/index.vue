<script setup lang="ts" name="Icon">
import { Button } from '@/components/ui/button'
import { ArrowUpIcon, BookOpenTextIcon, BugIcon, CalendarClockIcon, FileCodeCornerIcon, HammerIcon, Logs, MonitorIcon, NotebookTabsIcon, Palette, QrCodeIcon, SearchIcon } from 'lucide-vue-next'
import type { Component } from 'vue'
const icons: Record<string, Component> = { ArrowUpIcon, BookOpenTextIcon, BugIcon, CalendarClockIcon, FileCodeCornerIcon, HammerIcon, Logs, MonitorIcon, NotebookTabsIcon, Palette, QrCodeIcon, SearchIcon }
import { computed } from 'vue'

interface IconProps {
    name: string;
    background?: boolean;
    size?: number | string;
}

const props = withDefaults(defineProps<IconProps>(), {
    name: '',
    background: false,
    size: '4'
})

const icon = computed(() => {
    return icons[props.name] || null
})

</script>

<template>
    <span v-if="icon">
        <Button variant="secondary" v-if="background">
            <component :style="{ width: `${Number(props.size) * 0.25}rem`, height: `${Number(props.size) * 0.25}rem` }" :is="icon" />
        </Button>
        <component :is="icon" :style="{ width: `${Number(props.size) * 0.25}rem`, height: `${Number(props.size) * 0.25}rem` }" v-else />
    </span>
</template>

<style scoped lang="scss"></style>
