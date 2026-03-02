<script setup lang="ts" name="Home">
import { onMounted, ref, computed } from 'vue';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemActions,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item'

const uesrData = ref<any>(null)

const techStackData = computed(() => {
    return uesrData.value?.techStack || []
})

onMounted(() => {
    fetch('/user.json')
        .then(response => response.json())
        .then(data => {
            uesrData.value = data
            console.log(uesrData.value)
        })
})

</script>

<template>
    <div class="w-full px-[25%]">
        <h1 class="text-2xl font-extrabold">关于</h1>
        <h1 class="text-2xl font-extrabold">技术栈</h1>
        <div class="grid grid-cols-2 gap-4">
            <Item variant="muted" v-for="item in techStackData" :key="item.name">

                <ItemMedia variant="icon" class="size-12">
                    <span class="text-2xl">{{ item.icon }}</span>
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{{ item.name }}</ItemTitle>
                    <ItemDescription>
                        {{ item.description || '' }}
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <div class="w-full flex flex-col gap-y-2">
                        <p class="text-right" v-for="child in item.list" :key="child">
                            <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                                {{ child }}
                            </code>
                        </p>
                    </div>
                </ItemActions>
            </Item>
        </div>
        <h1 class="text-2xl font-extrabold">知识库</h1>
    </div>
</template>

<style scoped lang="scss"></style>
