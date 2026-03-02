<script setup lang="ts" name="Content">
import { ScrollArea } from '@/components/ui/scroll-area'
import useAppStore from '@/store/app'

const appStore = useAppStore()

</script>

<template>
    <div class="w-full flex-1 overflow-hidden">
        <ScrollArea class="w-full h-full p-4">
            <component :is="appStore.currentMenuComponent" />
        </ScrollArea>
    </div>
</template>

<style scoped lang="scss"></style>
