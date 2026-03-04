<script setup lang="ts" name="Tooltip">
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface TooltipProps {
    content: string
}

const props = withDefaults(defineProps<TooltipProps>(), {
    content: ''
})

</script>

<template>
    <div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger class="w-full">
                    <slot />
                </TooltipTrigger>
                <TooltipContent>
                    {{ props.content || '' }}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
</template>

<style scoped lang="scss"></style>
