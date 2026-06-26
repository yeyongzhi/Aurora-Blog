<script setup lang="ts" name="Tree">
import { ref, watch } from 'vue'
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FolderCode } from 'lucide-vue-next'
import TreeNode from './TreeNode.vue'

export interface TreeItem {
    key: string
    label: string
    children?: Array<TreeItem>
}

interface Props {
    data: Array<TreeItem>
    currentKey: string
}

const props = withDefaults(defineProps<Props>(), {
    data: () => [],
    currentKey: '',
})

const emit = defineEmits(['articleChanged'])

const handleArticleChanged = (key: string) => {
    emit('articleChanged', key)
}

const tree = ref<Array<TreeItem>>([])

watch(
    () => props.data,
    (newVal) => {
        if (newVal) {
            tree.value = newVal
        }
    },
    { immediate: true },
)
</script>

<template>
    <div class="w-full h-full">
        <div class="h-full flex justify-center items-center" v-if="tree.length === 0">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FolderCode />
                    </EmptyMedia>
                    <EmptyTitle class="text-base">暂无数据</EmptyTitle>
                </EmptyHeader>
            </Empty>
        </div>
        <ScrollArea class="w-full h-full rounded-md border" v-else>
            <div class="px-4 py-2 text-sm flex flex-col gap-y-2">
                <!-- TreeNode 内部递归引用自身，支持任意深度树形结构 -->
                <TreeNode
                    v-for="item in tree"
                    :key="item.key"
                    :node="item"
                    :currentKey="currentKey"
                    :depth="0"
                    @articleChanged="handleArticleChanged"
                />
            </div>
        </ScrollArea>
    </div>
</template>

<style scoped lang="scss"></style>
