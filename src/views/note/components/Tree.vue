<script setup lang="ts" name="Tree">
import { ref, watch } from 'vue'
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { FolderCode, FolderIcon, FileTextIcon } from 'lucide-vue-next'

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
    currentKey: ''
})

const emit = defineEmits(['articleChanged'])

const tree = ref<Array<TreeItem>>([])

const handleArticleChanged = (key: string) => {
    emit('articleChanged', key)
}

let handleChildren = (data: Array<TreeItem>): Array<TreeItem> => {
    return data.map(d => {
        return {
            ...d,
            children: d.children ? handleChildren(d.children) : [],
            showChildren: d.children && d.children.length > 0
        }
    })
}

const initTree = (data: Array<TreeItem>) => {
    tree.value = handleChildren(data)
}

watch(() => props.data, (newVal, _) => {
    if (newVal) {
        initTree(newVal)
    }
})

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
            <div class="px-4 py-2 text-sm mb-2 flex flex-col" v-for="item in tree" :key="item.key">
                <Collapsible :defaultOpen="true">
                    <CollapsibleTrigger>
                        <div class="flex items-center">
                            <FolderIcon class="size-4" />
                            <span class="ml-2">{{ item.label }}</span>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div class="mt-2 flex flex-col gap-y-2 pl-4" v-if="item.children && item.children.length > 0">
                            <div :class="`rounded-md border px-2 py-1 text-sm flex items-center justify-between cursor-pointer ${props.currentKey === child.key ? 'bg-primary text-primary-foreground' : ''}`"
                                v-for="child in item.children" :key="child.key"
                                @click="handleArticleChanged(child.key)">
                                <div class="flex items-center">
                                    <FileTextIcon class="size-4" />
                                    <span class="ml-2">{{ child.label }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="mt-2 text-center text-sm text-gray-500">暂无数据</div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </ScrollArea>
    </div>
</template>

<style scoped lang="scss"></style>
