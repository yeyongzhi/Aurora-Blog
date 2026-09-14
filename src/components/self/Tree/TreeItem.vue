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
        <button type="button"
            v-if="!item.children || item.children.length === 0"
            :class="['flex items-center justify-between cursor-pointer px-2 py-1 rounded-md', currentKey === item.key ? 'bg-primary text-primary-foreground' : 'hover:bg-accent']"
            @click="updateCurrentKey(item.key)"
        >
            <div class="flex items-center">
                <span class="ml-2">{{ item.label }}</span>
            </div>
        </button>
        <Collapsible v-else :defaultOpen="true" v-model:open="isExpanded">
            <div class="flex items-center">
                <CollapsibleTrigger :aria-label="`展开或收起 ${item.label}`">
                    <ChevronDownIcon v-if="isExpanded" class="size-4" />
                    <ChevronRightIcon v-else class="size-4" />
                </CollapsibleTrigger>
                <button v-if="item.selectable" type="button" class="ml-2 text-left" @click="updateCurrentKey(item.key)">{{ item.label }}</button>
                <span v-else class="ml-2">{{ item.label }}</span>
            </div>
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
