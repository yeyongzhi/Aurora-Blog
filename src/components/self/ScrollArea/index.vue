<script setup lang="ts" name="ScrollArea">
import { ScrollArea } from '@/components/ui/scroll-area';

</script>

<template>
    <ScrollArea ref="scrollAreaRootRef" class="w-full h-full">
        <slot></slot>
    </ScrollArea>
</template>

<style scoped lang="scss"></style>
