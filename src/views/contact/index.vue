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
    },
    {
        iconUrl: JuejinIcon,
        name: '掘金',
        description: '',
        link: "https://juejin.cn/user/2717648476705431",
    },
    {
        iconUrl: WyyIcon,
        name: '网易云音乐',
        description: '听见音乐的力量',
        link: "https://music.163.com/#/user/home?id=325840458",
    },
    {
        iconUrl: YuequeIcon,
        name: '语雀',
        description: '',
        link: "https://www.yuque.com/aurora1970",
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
                        <Button variant="outline">
                            <Icon name="SearchIcon" />
                            微信号 Aurora-O23
                        </Button>
                        <Dialog>
                            <DialogTrigger as-child>
                                <Button variant="outline">
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
                                <Button variant="outline" @click="openTab(item.link)">
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

<style scoped lang="scss"></style>
