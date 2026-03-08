<script setup lang="ts" name="Contact">
import { ref } from 'vue'
import Icon from '@/components/self/Icon/index.vue'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area';
import { openTab } from '@/utils';

import XhsIcon from '@/assets/images/social/xhs.png'
import JuejinIcon from '@/assets/images/social/juejin.png'
import WyyIcon from '@/assets/images/social/wyy.png'
import YuequeIcon from '@/assets/images/social/yuque.png'

const socialAccountData = ref([
    {
        iconUrl: XhsIcon,
        name: '小红书',
        description: '',
        link: "https://www.xiaohongshu.com/user/profile/659c9a180000000022008079",
        buttonClass: "xhs-btn-animation",
    },
    {
        iconUrl: JuejinIcon,
        name: '掘金',
        description: '',
        link: "https://juejin.cn/user/2717648476705431",
        buttonClass: "juejin-btn-animation",
    },
    {
        iconUrl: WyyIcon,
        name: '网易云音乐',
        description: '听见音乐的力量',
        link: "https://music.163.com/#/user/home?id=325840458",
        buttonClass: "wyy-btn-animation",
    },
    {
        iconUrl: YuequeIcon,
        name: '语雀',
        description: '',
        link: "https://www.yuque.com/aurora1970",
        buttonClass: "btn-green-animation",
    },
])

const codeRepositoryData = ref([
    {
        iconUrl: '',
        name: 'GitHub',
        description: '',
        link: "https://github.com/yeyongzhi",
    },
    {
        iconUrl: '',
        name: 'Gitee',
        description: '',
        link: "https://gitee.com/AuroraO23",
    },
    {
        iconUrl: '',
        name: 'CSDN',
        description: '',
        link: "https://blog.csdn.net/Aurora_1970s?type=blog",
    },
    {
        iconUrl: '',
        name: 'Npm 主页',
        description: '',
        link: "https://www.npmjs.com/settings/aurora_/packages",
    },
])

</script>

<template>
    <div class="w-full h-full p-4 overflow-hidden">
        <ScrollArea class="w-full h-full">
            <Card class="gap-2 py-4 flex-1 mb-4">
                <CardHeader>
                    <CardTitle class="flex text-lg items-center">
                        <img src="../../assets/images/social/wx.png" alt="WeChat" class="object-cover size-10 mr-2">
                        WeChat
                    </CardTitle>
                    <CardDescription>
                        
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="flex justify-start items-center gap-4">
                        <Button variant="outline" class="btn-green-animation">
                            <Icon name="SearchIcon" />
                            微信号 Aurora-O23
                        </Button>
                        <Dialog>
                            <DialogTrigger as-child>
                                <Button variant="outline" class="btn-green-animation">
                                    <Icon name="QrCodeIcon" />
                                    也可以直接扫码
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>扫描下方二维码</DialogTitle>
                                    <DialogDescription>
                                        记得备注一下
                                    </DialogDescription>
                                </DialogHeader>
                                <img src="../../assets/images/user/wechat.jpg" />
                                <DialogFooter>
                                    <DialogClose as-child>
                                        <Button variant="outline">
                                            关闭
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit">
                                        确认
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
            <div class="flex justify-between items-center gap-4">
                <Card class="gap-2 py-4 flex-1">
                    <CardHeader>
                        <CardTitle class="flex text-lg items-center">
                            <span>个人社交账号</span>
                        </CardTitle>
                        <CardDescription>
                            分享美好生活
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Item variant="muted" v-for="item in socialAccountData" :key="item.name" class="mb-4">
                            <ItemMedia variant="icon" class="size-10">
                                <img :src="item.iconUrl" class="object-cover">
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle class="font-bold text-base">{{ item.name }}</ItemTitle>
                                <ItemDescription class="text-sm">
                                    {{ item.description }}
                                </ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button variant="outline" @click="openTab(item.link)" :class="item.buttonClass || ''">
                                    点此查看
                                </Button>
                            </ItemActions>
                        </Item>
                    </CardContent>
                </Card>
                <Card class="gap-2 py-4 flex-1">
                    <CardHeader>
                        <CardTitle class="flex text-lg items-center">
                            <span>个人Code仓库</span>
                        </CardTitle>
                        <CardDescription>
                            记录一些个人项目的代码
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Item variant="muted" v-for="item in codeRepositoryData" :key="item.name" class="mb-4">
                            <ItemMedia variant="icon" class="size-10">

                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle class="font-bold text-base">{{ item.name }}</ItemTitle>
                                <ItemDescription class="text-sm">
                                    {{ item.description }}
                                </ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button variant="outline" @click="openTab(item.link)">
                                    点此查看
                                </Button>
                            </ItemActions>
                        </Item>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    </div>
</template>

<style scoped lang="scss">
.btn-green-animation {
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: green-float 2.5s ease-in-out infinite;
    border-color: #22c55e;
    color: #22c55e;

    &:hover {
        transform: scale(1.08) rotateY(8deg) rotateX(-5deg);
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: white;
        border-color: #16a34a;
        box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
        animation-play-state: paused;
    }

    &:active {
        transform: scale(0.95) rotateY(8deg) rotateX(-5deg);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
    }

    &:hover::before {
        left: 100%;
    }
}

@keyframes green-float {
    0%, 100% {
        // transform: translateY(0px);
        box-shadow: 0 5px 15px rgba(34, 197, 94, 0.2);
    }
    50% {
        // transform: translateY(-6px);
        box-shadow: 0 15px 30px rgba(34, 197, 94, 0.3);
    }
}

.xhs-btn-animation {
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: xhs-float 2.5s ease-in-out infinite;
    border-color: #ff2e4d;
    color: #ff2e4d;

    &:hover {
        transform: scale(1.08) rotateY(8deg) rotateX(-5deg);
        background: linear-gradient(135deg, #ff2e4d, #e11d3b);
        color: white;
        border-color: #e11d3b;
        box-shadow: 0 10px 30px rgba(255, 46, 77, 0.4);
        animation-play-state: paused;
    }

    &:active {
        transform: scale(0.95) rotateY(8deg) rotateX(-5deg);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
    }

    &:hover::before {
        left: 100%;
    }
}

@keyframes xhs-float {
    0%, 100% {
        box-shadow: 0 5px 15px rgba(255, 46, 77, 0.2);
    }
    50% {
        box-shadow: 0 15px 30px rgba(255, 46, 77, 0.3);
    }
}

.juejin-btn-animation {
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: juejin-float 2.5s ease-in-out infinite;
    border-color: #1f81ff;
    color: #1f81ff;

    &:hover {
        transform: scale(1.08) rotateY(8deg) rotateX(-5deg);
        background: linear-gradient(135deg, #1f81ff, #0066cc);
        color: white;
        border-color: #0066cc;
        box-shadow: 0 10px 30px rgba(31, 129, 255, 0.4);
        animation-play-state: paused;
    }

    &:active {
        transform: scale(0.95) rotateY(8deg) rotateX(-5deg);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
    }

    &:hover::before {
        left: 100%;
    }
}

@keyframes juejin-float {
    0%, 100% {
        box-shadow: 0 5px 15px rgba(31, 129, 255, 0.2);
    }
    50% {
        box-shadow: 0 15px 30px rgba(31, 129, 255, 0.3);
    }
}

.wyy-btn-animation {
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: wyy-float 2.5s ease-in-out infinite;
    border-color: #E20000;
    color: #E20000;

    &:hover {
        transform: scale(1.08) rotateY(8deg) rotateX(-5deg);
        background: linear-gradient(135deg, #E20000, #b80000);
        color: white;
        border-color: #b80000;
        box-shadow: 0 10px 30px rgba(226, 0, 0, 0.4);
        animation-play-state: paused;
    }

    &:active {
        transform: scale(0.95) rotateY(8deg) rotateX(-5deg);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
    }

    &:hover::before {
        left: 100%;
    }
}

@keyframes wyy-float {
    0%, 100% {
        box-shadow: 0 5px 15px rgba(226, 0, 0, 0.2);
    }
    50% {
        box-shadow: 0 15px 30px rgba(226, 0, 0, 0.3);
    }
}
</style>
