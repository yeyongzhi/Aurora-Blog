<script setup lang="ts" name="Icon">
import { Button } from '@/components/ui/button'
import * as lucideIcon from 'lucide-vue-next';
import { computed } from 'vue'

interface IconProps {
    name: string;
    background?: boolean;
    size?: number | string;
}

const props = withDefaults(defineProps<IconProps>(), {
    name: '',
    background: false,
    size: '4'
})

const icon = computed(() => {
    return props.name in lucideIcon ? (lucideIcon as any)[props.name] : null
})

</script>

<template>
    <span v-if="icon">
        <Button variant="secondary" v-if="background">
            <component :class="`size-${props.size}`" :is="icon" />
        </Button>
        <component :is="icon" v-else />
    </span>
</template>

<style scoped lang="scss"></style>
