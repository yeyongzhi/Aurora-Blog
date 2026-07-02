<script setup lang="ts" name="Tree">
import { ref, watch, provide } from 'vue'
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, List, ListCollapse } from 'lucide-vue-next'
import TreeNode from './TreeNode.vue'
import { Button } from '@/components/ui/button'
import Tooltip from '@/components/self/Tooltip/index.vue'

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

// 全局展开/折叠控制
const isAllExpanded = ref(true) // 默认全部展开
const toggleVersion = ref(0)    // 递增版本号，触发所有子节点响应

// 通过 provide 向所有递归子节点下发状态
provide('expandAllControl', {
    isAllExpanded,
    toggleVersion,
})

const toggleExpandAll = () => {
    isAllExpanded.value = !isAllExpanded.value
    toggleVersion.value++
}
</script>

<template>
    <div class="w-full h-full">
        <div class="h-full flex justify-center items-center" v-if="tree.length === 0">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Folder />
                    </EmptyMedia>
                    <EmptyTitle class="text-base">暂无数据</EmptyTitle>
                </EmptyHeader>
            </Empty>
        </div>
        <ScrollArea class="w-full h-full rounded-md border" v-else>
            <div class="px-4 py-2 text-sm flex flex-col gap-y-2">
                <!-- 一键展开/折叠按钮 -->
                <div class="flex justify-start">
                    <Tooltip :content="isAllExpanded ? '一键收起' : '一键展开'">
                        <Button variant="secondary" @click="toggleExpandAll">
                            <ListCollapse v-if="isAllExpanded" />
                            <List v-else />
                        </Button>
                    </Tooltip>
                </div>
                <!-- TreeNode 内部递归引用自身，支持任意深度树形结构 -->
                <TreeNode v-for="item in tree" :key="item.key" :node="item" :currentKey="currentKey" :depth="0"
                    @articleChanged="handleArticleChanged" />
            </div>
        </ScrollArea>
    </div>
</template>

<style scoped lang="scss"></style>
