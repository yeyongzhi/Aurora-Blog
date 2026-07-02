<script setup lang="ts" name="TreeNode">
import { ref, inject, watch } from 'vue'
import { Folder, FolderOpen, FileTextIcon, ChevronRightIcon } from 'lucide-vue-next'
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

// 从父组件注入全局展开/折叠控制
const expandControl = inject<{ isAllExpanded: { value: boolean }; toggleVersion: { value: number } } | null>('expandAllControl', null)

// 文件夹初始默认全部展开
const isFolderOpen = ref(true)

// 监听全局一键展开/折叠：当父组件触发切换时，同步状态
if (expandControl) {
    watch(
        () => expandControl.toggleVersion.value,
        () => {
            isFolderOpen.value = expandControl.isAllExpanded.value
        },
    )
}
</script>

<template>
    <!-- 叶子节点：渲染为可点击的文章条目 -->
    <div
        v-if="isLeafNode(node)"
        :class="[
            'flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer transition-all duration-200 border-l-2',
            currentKey === node.key
                ? 'bg-primary/10 dark:bg-primary/20 text-accent-foreground border-l-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border-l-transparent font-normal',
        ]"
        @click="handleArticleChanged(node.key)"
    >
        <FileTextIcon class="size-4 shrink-0" />
        <span class="truncate">{{ node.label }}</span>
    </div>

    <!-- 非叶子节点：渲染为可折叠分类，递归渲染子节点 -->
    <Collapsible v-else v-model:open="isFolderOpen">
        <CollapsibleTrigger class="w-full">
            <div class="flex items-center gap-2 w-full px-2 py-2 text-sm rounded-md cursor-pointer transition-all duration-200 hover:bg-accent hover:text-accent-foreground font-medium text-foreground">
                <ChevronRightIcon
                    class="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
                    :class="{ 'rotate-90': isFolderOpen }"
                />
                <FolderOpen v-if="isFolderOpen" class="size-4 shrink-0" />
                <Folder v-else class="size-4 shrink-0" />
                <span class="truncate">{{ node.label }}</span>
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <div class="mt-1 flex flex-col gap-y-1 pl-4">
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
