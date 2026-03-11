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
import TreeItem from './TreeItem.vue'

export interface TreeItem {
    key: string
    label: string
    children?: Array<TreeItem>
}

interface Props {
    data: Array<TreeItem>;
    currentKey?: string;
}

interface Emits {
    (e: 'update:currentKey', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
    data: () => [],
    currentKey: ''
})

const emit = defineEmits<Emits>()

const tree = ref<Array<TreeItem>>([])

const initTree = (data: Array<TreeItem>) => {
    tree.value = data
}

watch(() => props.data, (newVal, _) => {
    if (newVal) {
        initTree(newVal)
    }
})

const updateCurrentKey = (key: string) => {
    emit('update:currentKey', key)
}
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
        <ScrollArea class="w-full h-full" v-else>
            <TreeItem
                v-for="item in tree"
                :key="item.key"
                :item="item"
                :currentKey="props.currentKey"
                @update:currentKey="updateCurrentKey"
            />
        </ScrollArea>
    </div>
</template>

<style scoped lang="scss"></style>
