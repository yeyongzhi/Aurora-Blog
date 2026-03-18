<script setup lang="ts" name="TreeItem">
import { ref } from 'vue'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronRightIcon, ChevronDownIcon } from 'lucide-vue-next'
import type { TreeItem } from './index.vue'

export interface TreeItemProps {
    item: TreeItem
    currentKey?: string
}

const props = defineProps<TreeItemProps>()

const emit = defineEmits<{
    (e: 'update:currentKey', value: string): void
}>()

const updateCurrentKey = (key: string) => {
    emit('update:currentKey', key)
}

const isExpanded = ref(true)

</script>

<template>
    <div class="text-sm flex flex-col">
        <div
            v-if="!item.children || item.children.length === 0"
            :class="['flex items-center justify-between cursor-pointer px-2 py-1 rounded-md', currentKey === item.key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent']"
            @click="updateCurrentKey(item.key)"
        >
            <div class="flex items-center">
                <span class="ml-2">{{ item.label }}</span>
            </div>
        </div>
        <Collapsible v-else :defaultOpen="true" v-model:open="isExpanded">
            <CollapsibleTrigger>
                <div class="flex items-center">
                    <ChevronDownIcon v-if="isExpanded" class="size-4" />
                    <ChevronRightIcon v-else class="size-4" />
                    <span class="ml-2">{{ item.label }}</span>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div class="flex flex-col pl-4">
                    <TreeItem
                        v-for="child in item.children"
                        :key="child.key"
                        :item="child"
                        :currentKey="currentKey"
                        @update:currentKey="updateCurrentKey"
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>
    </div>
</template>

<style scoped lang="scss"></style>
