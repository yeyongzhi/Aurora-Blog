<script setup lang="ts" name="TreeNode">
import { ref } from 'vue'
import { FolderIcon, FileTextIcon } from 'lucide-vue-next'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

// 递归组件：直接引用自身，无需额外注册
// Vue 3 <script setup> 会自动将组件名（TreeNode）暴露给模板，支持模板内递归调用

interface TreeItem {
    key: string
    label: string
    children?: Array<TreeItem>
}

interface Props {
    node: TreeItem
    currentKey: string
    depth: number
}

const props = withDefaults(defineProps<Props>(), {
    depth: 0,
})

const emit = defineEmits(['articleChanged'])

// 没有 children 或 children 为空 → 叶子节点，视为文章
const isLeafNode = (node: TreeItem) => {
    return !node.children || node.children.length === 0
}

const handleArticleChanged = (key: string) => {
    emit('articleChanged', key)
}
</script>

<template>
    <!-- 叶子节点：渲染为可点击的文章卡片 -->
    <div
        v-if="isLeafNode(node)"
        :class="[
            'rounded-md border px-2 py-1 text-sm flex items-center justify-between cursor-pointer transition-colors',
            currentKey === node.key
                ? 'bg-primary text-primary-foreground'
                : 'text-card-foreground hover:bg-accent hover:text-accent-foreground',
        ]"
        @click="handleArticleChanged(node.key)"
    >
        <div class="flex items-center">
            <FileTextIcon class="size-4" />
            <span class="ml-2">{{ node.label }}</span>
        </div>
    </div>

    <!-- 非叶子节点：渲染为可折叠分类，递归渲染子节点 -->
    <Collapsible v-else :defaultOpen="depth < 1">
        <CollapsibleTrigger class="w-full">
            <div class="flex items-center py-1 hover:text-primary cursor-pointer">
                <FolderIcon class="size-4" />
                <span class="ml-2">{{ node.label }}</span>
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <div class="mt-2 flex flex-col gap-y-2 pl-4">
                <!-- 关键：组件引用自身，实现递归渲染，支持任意深度 -->
                <TreeNode
                    v-for="child in node.children"
                    :key="child.key"
                    :node="child"
                    :currentKey="currentKey"
                    :depth="depth + 1"
                    @articleChanged="handleArticleChanged"
                />
            </div>
        </CollapsibleContent>
    </Collapsible>
</template>

<style scoped lang="scss"></style>
