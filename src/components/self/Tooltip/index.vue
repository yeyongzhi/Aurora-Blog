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
            <TooltipContent>
                {{ props.content || '' }}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<style scoped lang="scss"></style>
