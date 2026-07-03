<script setup lang="ts" name="WelcomeQuickStart">
import useAppStore from '@/store/app'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, BookMarkedIcon, BoxesIcon, ContactIcon, MapIcon } from 'lucide-vue-next'

const appStore = useAppStore()

const links = [
    {
        title: '前端导航',
        description: 'MDN、Vue、Vite、CSS 工具站一站直达。',
        key: 'nav',
        icon: MapIcon,
    },
    {
        title: '笔记本',
        description: 'AI、Vue、Git、浏览器等知识沉淀。',
        key: 'note',
        icon: BookMarkedIcon,
    },
    {
        title: '工具箱',
        description: '开发、学习、生活相关的小工具集合。',
        key: 'toolbox',
        icon: BoxesIcon,
    },
    {
        title: '联系我',
        description: 'GitHub、掘金、小红书和微信入口。',
        key: 'contact',
        icon: ContactIcon,
    },
]
</script>

<template>
    <section class="mt-6 pb-2">
        <div class="mb-4">
            <h2 class="text-2xl font-bold">快速开始</h2>
            <p class="mt-2 text-muted-foreground">这些入口可以先保留在欢迎页底部，方便访问者继续探索。</p>
        </div>
        <div class="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
            <button
                v-for="item in links"
                :key="item.key"
                class="grid min-h-[92px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent"
                @click="appStore.handleMenuChange(item.key)"
            >
                <component :is="item.icon" class="size-5" />
                <span class="flex min-w-0 flex-col gap-1">
                    <strong class="text-[15px]">{{ item.title }}</strong>
                    <small class="leading-6 text-muted-foreground">{{ item.description }}</small>
                </span>
                <ArrowRightIcon class="size-4 text-muted-foreground" />
            </button>
        </div>
        <div class="mt-4 flex items-center justify-between gap-4 rounded-lg border bg-muted/35 p-4 text-muted-foreground max-sm:flex-col max-sm:items-start">
            <span>后续建议：接入最近文章、访问统计、GitHub 项目、站点更新日志。</span>
            <Button variant="secondary" size="sm" @click="appStore.handleMenuChange('about')">查看应用介绍</Button>
        </div>
    </section>
</template>
