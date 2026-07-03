<script setup lang="ts" name="WelcomeModuleGrid">
import {
    BellIcon,
    BlocksIcon,
    LightbulbIcon,
    MessageSquareTextIcon,
    RouteIcon,
    SparklesIcon,
} from 'lucide-vue-next'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

const modules = [
    {
        title: '最新动态',
        description: '放最近更新的文章、笔记、生活记录，适合作为站点时间线入口。',
        icon: BellIcon,
        meta: '今天更新',
        items: ['Vue 组件通信复盘', '浏览器缓存机制笔记', '2026 学习计划草稿'],
    },
    {
        title: '精选内容',
        description: '放高质量文章、项目复盘、长期维护的知识卡片，帮助访客快速了解重点。',
        icon: SparklesIcon,
        meta: '长期维护',
        items: ['前端工程化清单', 'TypeScript 常用范式', '个人博客搭建记录'],
    },
    {
        title: '学习路线',
        description: '放前端、工程化、算法、面试等路线，后续可以接成专题合集。',
        icon: RouteIcon,
        meta: '4 条路线',
        items: ['Vue3 深入路线', '浏览器基础路线', 'Node 工具链路线'],
    },
    {
        title: '工具快捷入口',
        description: '放常用导航、工具箱、代码包等高频入口，提高主页实用性。',
        icon: BlocksIcon,
        meta: '高频使用',
        items: ['JSON 格式化', '颜色转换', '正则表达式备忘'],
    },
    {
        title: '个人状态',
        description: '放当前正在学习、正在做的项目、最近读的书，让页面更有生命力。',
        icon: LightbulbIcon,
        meta: '进行中',
        items: ['重构欢迎页', '整理 AI 笔记', '补充 WebGIS 章节'],
    },
    {
        title: '留言反馈',
        description: '放联系方式、留言入口、社交链接，方便访问者继续交流。',
        icon: MessageSquareTextIcon,
        meta: '欢迎交流',
        items: ['GitHub Issue', '微信二维码', '站点建议收集'],
    },
]
</script>

<template>
    <section class="mt-6">
        <div class="mb-4">
            <h2 class="text-2xl font-bold">欢迎页可以放这些模块</h2>
            <p class="mt-2 text-muted-foreground">先放一组 mock 数据，后续可以逐块替换为真实接口或本地 json。</p>
        </div>
        <div class="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
            <Card v-for="item in modules" :key="item.title" class="min-h-[230px] rounded-lg">
                <CardHeader>
                    <div class="flex items-center justify-between gap-3">
                        <component :is="item.icon" class="size-5" />
                        <span class="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{{ item.meta }}</span>
                    </div>
                    <CardTitle class="mt-2">{{ item.title }}</CardTitle>
                    <CardDescription>{{ item.description }}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul class="space-y-2 text-sm">
                        <li v-for="child in item.items" :key="child" class="flex items-center gap-2 text-muted-foreground">
                            <span class="size-1.5 rounded-full bg-primary" />
                            <span class="truncate">{{ child }}</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    </section>
</template>
