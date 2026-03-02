<script setup lang="ts" name="Knowledge">
import useAppStore from '@/store/app';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const appStore = useAppStore();

interface KnowledgeItem {
    icon: string;
    title: string;
    badge?: number;
    descriptions: string;
    link: {
        url: string;
        text?: string;
    };
}

interface Props {
    data: KnowledgeItem[]
}

const props = withDefaults(defineProps<Props>(), {
    data: () => []
})

</script>

<template>
    <div class="grid grid-cols-3 gap-4 my-4">
        <Card v-for="item in props.data" :key="item.title" class="gap-4 py-4">
            <CardHeader>
                <CardTitle class="flex text-lg items-center">
                    <span class="mr-2 text-2xl">{{ item.icon }}</span>
                    {{ item.title }}
                </CardTitle>
                <CardDescription>
                    {{ item.descriptions }}
                </CardDescription>
            </CardHeader>
            <CardFooter class="flex justify-end">
                <Button size="sm" @click="appStore.gotoPage(item.link.url)">
                    {{ item.link.text || '去看看' }}
                </Button>
            </CardFooter>
        </Card>
    </div>
</template>

<style scoped lang="scss"></style>
