<script setup lang="ts" name="TreeItem">
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronRightIcon } from 'lucide-vue-next'
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
</script>

<template>
    <div class="text-sm flex flex-col">
        <div
            v-if="!item.children || item.children.length === 0"
            :class="['flex items-center justify-between cursor-pointer px-2 py-1 rounded-md', currentKey === item.key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent']"
            @click="updateCurrentKey(item.key)"
        >
            <div class="flex items-center">
                <span class="ml-2">{{ item.name }}</span>
            </div>
        </div>
        <Collapsible v-else :defaultOpen="true">
            <CollapsibleTrigger>
                <div class="flex items-center">
                    <ChevronRightIcon class="size-4" />
                    <span class="ml-2">{{ item.name }}</span>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div class="mt-2 flex flex-col gap-y-2 pl-4">
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
