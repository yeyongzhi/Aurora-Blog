<script setup lang="ts" name="About">
import useAppStore from '@/store/app'
import { Button } from '@/components/ui/button'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserIcon, BoxIcon, PhoneCallIcon, CpuIcon } from 'lucide-vue-next';

const appStore = useAppStore()

</script>

<template>
    <div class="w-full p-4">
        <ScrollArea class="w-[50%]">
            <Item variant="outline" class="mb-4">
                <ItemMedia variant="icon" class="size-12">
                    <BoxIcon class="size-6" />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>应用介绍</ItemTitle>
                    <ItemDescription>
                        <p>这是我的个人芝士🧀博客，里面主要记录自己的一些学习、成长等东西。啥都会写一点。</p>
                        <p>欢迎观看，一起学习进步，go go go！</p>
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="secondary" size="sm" @click="appStore.handleMenuChange('home')">
                        <UserIcon class="size-4" />
                        前往主页
                    </Button>
                </ItemActions>
            </Item>
            <Item variant="outline" class="mb-4">
                <ItemMedia variant="icon" class="size-12">
                    <CpuIcon class="size-6" />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>技术栈</ItemTitle>
                    <ItemDescription>
                        <p>【框架】 Vue3 + TypeScript + Vite + Pinia</p>
                        <p>【UI库】 Shadcn-vue tailwindcss</p>
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    
                </ItemActions>
            </Item>
            <Item variant="outline">
                <ItemMedia variant="icon" class="size-12">
                    <PhoneCallIcon class="size-6" />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>联系煮播</ItemTitle>
                    <ItemDescription>
                        <p>欢迎你有任何想法，建议，或者想和我分享一些东西，都可以联系我。</p>
                        <p>戳右边联系~</p>
                    </ItemDescription>
                </ItemContent>
                <ItemActions>
                    <Button variant="secondary" size="sm" @click="appStore.handleMenuChange('contact')">
                        联系方式
                    </Button>
                </ItemActions>
            </Item>
        </ScrollArea>
    </div>
</template>

<style scoped lang="scss"></style>
