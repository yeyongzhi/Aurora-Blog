<script setup lang="ts" name="Empty">
import { FolderCode } from 'lucide-vue-next'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'

interface Props {
    size?: number;
    description?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: 10,
    description: '暂无数据'
})

</script>

<template>
    <Empty class="w-full h-full">
        <EmptyHeader>
            <EmptyMedia variant="icon" class="p-4">
                <FolderCode />
            </EmptyMedia>
            <EmptyTitle class="text-sm">{{ props.description }}</EmptyTitle>
        </EmptyHeader>
    </Empty>
</template>

<style scoped lang="scss"></style>
