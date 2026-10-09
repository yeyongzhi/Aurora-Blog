<script setup lang="ts" name="Tooltip">
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface TooltipProps {
    content: string
    disabled?: boolean
}

const props = withDefaults(defineProps<TooltipProps>(), {
    content: '',
    disabled: false,
})

</script>

<template>
    <slot v-if="props.disabled || !props.content" />
    <TooltipProvider v-else>
        <Tooltip>
            <TooltipTrigger as-child>
                <slot />
            </TooltipTrigger>
            <TooltipContent class="max-w-80 whitespace-pre-line break-words">
                {{ props.content || '' }}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<style scoped lang="scss"></style>
