<script setup lang="ts" name="ArticleSlideMenu">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-vue-next'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { type NoteTreeItem } from '@/views/note/index.vue'

interface Props {
    visible: boolean;
    treeData: Array<NoteTreeItem>;
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
    treeData: () => [],
})

const getTotal = (tree: Array<any>) => {
    let total = 0
    tree.forEach((item) => {
        if (item.children && item.children.length > 0) {
            total += getTotal(item.children)
        }
        if (!item.children) {
            total++
        }
    })
    return total
}

const articleTotalNum = computed(() => {
    return getTotal(props.treeData)
})

const emits = defineEmits(['toggle'])

</script>

<template>
    <Card class="w-[300px] gap-4 py-4">
        <CardHeader>
            <CardTitle>菜单导航</CardTitle>
            <CardDescription>
                共 <span class="text-sm font-bold">{{ articleTotalNum }}</span> 篇文章
            </CardDescription>
            <CardAction>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button size="sm" variant="secondary" @click="emits('toggle')">
                                <ChevronsLeftIcon class="size-4" v-if="props.visible" />
                                <ChevronsRightIcon class="size-4" v-else />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {{ props.visible ? '收起' : '展开' }}菜单
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardAction>
        </CardHeader>
        <CardContent class="overflow-hidden">
            <slot />
        </CardContent>
    </Card>
</template>

<style scoped lang="scss"></style>
