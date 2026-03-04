<script setup lang="ts" name="Loading">
import { LoaderIcon } from 'lucide-vue-next'

interface Props {
    size?: number;
    description?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: 8,
    description: '加载中...'
})

</script>

<template>
    <div class="flex items-center justify-center">
        <LoaderIcon :class="`size-${props.size} animate-spin`" />
        <p v-if="props.description" class="ml-2 text-sm text-gray-500">{{ props.description }}</p>
    </div>
</template>

<style scoped lang="scss"></style>
