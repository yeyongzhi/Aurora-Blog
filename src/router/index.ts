import { defineAsyncComponent } from "vue";

interface RouterMeta {
    name: string;
    key: string;
    component: Function;
    children?: RouterMeta[];
}

const APP_MENU: RouterMeta[] = [
    {
        name: '主页',
        key: 'home',
        component: defineAsyncComponent(() => import('@/views/home/index.vue')),
    },
]

export default APP_MENU