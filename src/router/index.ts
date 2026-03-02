import { defineAsyncComponent } from "vue";

interface RouterMeta {
    name: string;
    key: string;
    component?: Function;
    children?: RouterMeta[];
}

const APP_MENU: RouterMeta[] = [
    {
        name: '前端导航',
        key: 'nav',
        component: defineAsyncComponent(() => import('@/views/nav/index.vue')),
    },
    {
        name: '主页',
        key: 'home',
        component: defineAsyncComponent(() => import('@/views/home/index.vue')),
    },
    {
        name: '笔记',
        key: 'note',
        component: defineAsyncComponent(() => import('@/views/note/index.vue')),
    },
    {
        name: '面经',
        key: 'interview',
        component: defineAsyncComponent(() => import('@/views/interview/index.vue')),
    },
    {
        name: 'A Life清单',
        key: 'alife',
        component: defineAsyncComponent(() => import('@/views/alife/index.vue')),
    },
    {
        name: '更多',
        key: 'more',
        children: [
            {
                name: '关于',
                key: 'about',
                component: defineAsyncComponent(() => import('@/views/about/index.vue')),
            },
            {
                name: '版本日志',
                key: 'version',
                component: defineAsyncComponent(() => import('@/views/version/index.vue')),
            },
            {
                name: '联系',
                key: 'contact',
                component: defineAsyncComponent(() => import('@/views/contact/index.vue')),
            },
        ]
    },
]

export default APP_MENU