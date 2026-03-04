<script setup lang="ts" name="Nav">
import { computed } from 'vue'
import { type LinkItem } from '../index.vue'
import Tooltip from '@/components/self/Tooltip/index.vue'
import { openTab } from '@/utils';

const props = withDefaults(defineProps<{
    data: LinkItem;
}>(), {
    data: () => {
        return {
            name: '',
            url: '',
        }
    }
})

const detailData = computed(() => {
    return props.data
})

</script>

<template>
    <div class="border rounded-md p-4 hover:bg-accent cursor-pointer" @click="openTab(detailData.url)">
        <!-- 头部 -->
        <div class="flex items-center justify-start">
            <div class="size-10 flex items-center justify-center bg-gray-200 rounded-md">
                <img v-if="detailData.icon" class="size-6" :src="detailData.icon" :alt="detailData.name" />
            </div>
            <div class="ml-2 font-bold">{{ detailData.name }}</div>
        </div>
        <!-- 描述 -->
        <div v-if="detailData.descriptions" class="text-sm mt-4 w-full">
            <Tooltip :content="detailData.descriptions">
                <p class="text-left overflow-hidden text-ellipsis whitespace-nowrap">{{ detailData.descriptions || '' }}</p>
            </Tooltip>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
