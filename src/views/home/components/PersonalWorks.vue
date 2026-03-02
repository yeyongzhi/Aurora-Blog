<script setup lang="ts" name="Home">
import { Button } from '@/components/ui/button'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item'

interface PersonalWorkItem {
    icon: string;
    name: string;
    description: string;
    routePath?: string;
    link?: string;
}

interface Props {
    data: PersonalWorkItem[]
}

const props = withDefaults(defineProps<Props>(), {
    data: () => []
})

</script>

<template>
    <div class="flex flex-col gap-4 my-4">
        <Item variant="muted" v-for="item in props.data" :key="item.name">
            <ItemMedia variant="icon" class="size-12">
                <span class="text-2xl">{{ item.icon }}</span>
            </ItemMedia>
            <ItemContent>
                <ItemTitle class="font-bold text-base">{{ item.name }}</ItemTitle>
                <ItemDescription class="text-sm">
                    {{ item.description }}
                </ItemDescription>
            </ItemContent>
            <ItemActions>
                <Button size="sm">
                    去看看
                </Button>
            </ItemActions>
        </Item>
    </div>
</template>

<style scoped lang="scss"></style>
