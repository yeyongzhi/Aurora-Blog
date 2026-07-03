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
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger ref="triggerRef" as-child>
                <slot />
            </TooltipTrigger>
            <TooltipContent class="max-w-80 whitespace-pre-line break-words">
                {{ props.content || '' }}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<style scoped lang="scss"></style>
