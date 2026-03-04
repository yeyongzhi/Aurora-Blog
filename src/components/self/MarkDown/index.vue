<script setup lang="ts" name="MarkDown">
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area';
import { ref, watch, computed, onMounted, onUnmounted, nextTick, shallowRef } from 'vue';
import { formatMarkDown } from '@/utils/markdown'
import message from '@/plugins/message'
import { openTab, getMarkDownContent, scrollToTop, getArticleTextCount, getMarkDownInfo } from '@/utils/index'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { FileClockIcon, NewspaperIcon, LinkIcon } from 'lucide-vue-next'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import Tooltip from '@/components/self/Tooltip/index.vue'
import { Button } from '@/components/ui/button'
import Tree from '../Tree/index.vue'
import { ChevronsUpIcon, ChevronsDownIcon } from 'lucide-vue-next'

// 扩展插件
dayjs.extend(utc);
dayjs.extend(timezone);

const markdownContent = ref<any>(null)
const markdownInfo = ref<any>({
    lastModified: '',
}) // 文章信息
const markdownLoading = ref(false)

const { path } = defineProps({
    path: { type: String, required: true, default: '' },
})

const copyCode = (content: string) => {
    navigator.clipboard.writeText(content)
        .then(() => {
            message.success("复制成功")
        })
        .catch(() => {
            message.error("复制出错，请重试")
        });
}

const findTitleRange = (list: Array<any>, level: number, originResult: Array<any> = []) => {
    let result: any[] = originResult
    for (let i = 0; i < list.length; i++) {
        if ((list[i].type.startsWith("h") && (Number(list[i].type.replace("h", "")) === level))) {
            if (level === 1) {
                result.push({
                    ...list[i],
                    index: i,
                    name: list[i].content.replace(/#/g, "").trim(),
                    key: `md_nav_${i}`
                })
            } else {
                const findLastIndex = (list2: any) => {
                    let parentTitleIndex = list2.findIndex((r: any) => {
                        return r.index > i
                    })
                    if (parentTitleIndex === -1) {
                        parentTitleIndex = list2.length - 1
                    } else {
                        parentTitleIndex = parentTitleIndex - 1
                    }
                    return parentTitleIndex
                }
                let targetIndex = findLastIndex(result)
                let target = result[targetIndex]
                if (level >= 3) {
                    for (let j = 2; j < level; j++) {
                        targetIndex = findLastIndex(target.children)
                        target = target.children[targetIndex]
                        if (j === level - 1) {
                            if (!target.children) {
                                target.children = []
                            }
                            target.children.push({
                                ...list[i],
                                index: i,
                                // children: [],
                                name: list[i].content.replace(/#/g, "").trim(),
                                key: `md_nav_${i}`
                            })
                        }
                    }
                } else {
                    if (!target.children) {
                        target.children = []
                    }
                    target.children.push({
                        ...list[i],
                        index: i,
                        // children: [],
                        name: list[i].content.replace(/#/g, "").trim(),
                        key: `md_nav_${i}`
                    })
                }
            }
        }
    }
    return result
}


const guideVisible = ref(true)
const toggleGuideVisible = () => {
    guideVisible.value = !guideVisible.value
}
const markdown_nav = computed(() => {
    if (!markdownContent.value) {
        return []
    }
    let list: any = []
    list = findTitleRange(markdownContent.value, 1)
    list = findTitleRange(markdownContent.value, 2, list)
    list = findTitleRange(markdownContent.value, 3, list)
    list = findTitleRange(markdownContent.value, 4, list)
    list = findTitleRange(markdownContent.value, 5, list)
    list = findTitleRange(markdownContent.value, 6, list)
    // console.log("文章目录生成如下：")
    // console.log(list)
    return list
})

const markdownNavCount = computed(() => {
    if (!markdown_nav.value) {
        return 0
    }
    let count = 0
    const traverse = (items: any[]) => {
        for (const item of items) {
            count++
            if (item.children) {
                traverse(item.children)
            }
        }
    }
    traverse(markdown_nav.value)
    return count
})

const handleNavClick = (name: string) => {
    location.hash = `#${name}`
}

watch(() => path, async (newVal) => {
    if (newVal && newVal !== "") {
        markdownLoading.value = true
        const result = await getMarkDownContent(newVal)
        console.log("文章内容：")
        console.log(result)
        const info = await getMarkDownInfo(newVal)
        if (info) {
            const localTime = dayjs(info).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
            markdownInfo.value = {
                lastModified: localTime
            }
            // console.log(markdownInfo.value)
        }
        if (result) {
            message.success("文章加载成功")
            const data = formatMarkDown(result)
            console.log(data)
            markdownContent.value = data;
        } else {
            message.error("未找到文章")
            markdownContent.value = null;
        }
        markdownLoading.value = false
        nextTick(() => {
            scrollToTop()
        })
    }
}, { immediate: true })

const scrollAreaRootRef = shallowRef<any>(null)
const scrollToSection = () => {
    const decodedHash = decodeURIComponent(location.hash.substring(1));
    const element = document.getElementById('markdown_nav_' + decodedHash);
    // console.log(element)
    if (element) {
        const options = {
            top: element.getBoundingClientRect().top + scrollAreaRootRef.value.scrollTop - 100,
            behavior: 'smooth'
        }
        // console.log(options)
        scrollAreaRootRef.value.scrollTo(options);
    }
}

const currentNavKey = ref("")

const getCurrentNavName = (data: Array<any>, key: string) => {
    let name = null
    data.forEach((item: any) => {
        if (item.key === key) {
            name = item.name
        }
        if (item.children) {
            name = getCurrentNavName(item.children, key)
        }
    })
    return name
}

watch(() => currentNavKey.value, (newVal, _) => {
    if (newVal) {
        let name = getCurrentNavName(markdown_nav.value, newVal)
        if (name) {
            handleNavClick(name)
        }
    }
})

onMounted(() => {
    window.addEventListener('hashchange', scrollToSection);
})

onUnmounted(() => {
    window.removeEventListener('hashchange', scrollToSection);
})

const renderTitleId = (item: any) => {
    return 'markdown_nav_' + item.content.replace(/#/g, "").trim()
}

const renderCode = (content: string[]) => {
    // console.log('First line:', JSON.stringify(content[0]))
    const codeStr = content.join('\n')
    return codeStr
}

const getImageUrl = (url: string) => {
    const basePath = path.substring(0, path.lastIndexOf("/"))
    return basePath + url.replace(".", "")
}

const getEmptyDescription = computed(() => {
    if (Array.isArray(markdownContent) && markdownContent.length === 0) {
        return '暂无内容'
    }
    return `【${path}】: 找不到文章~`
})

const articelTextTotal = computed(() => {
    if (!markdownContent.value) {
        return '-'
    }
    return getArticleTextCount(markdownContent.value)
})

</script>

<template>
    <div class="relative w-full h-full overflow-hidden">
        <template v-if="markdownLoading">
            ...
        </template>
        <!-- 文章内容 -->
        <ScrollArea ref="scrollAreaRootRef" class="w-full h-full text-4 pr-[350px]" v-else>
            <template v-for="(item, index) in markdownContent" :key="'md' + index">
                <template v-if="item.type === 'h1'">
                    <h1 :class="`md_${item.type} mb-8 text-4xl font-extrabold tracking-tight text-balance`"
                        :id="renderTitleId(item)">{{ item.content.trim().replace(/#/g, "") }}</h1>
                </template>
                <template v-else-if="item.type === 'h2'">
                    <h2 :class="`md_${item.type} my-6 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0`"
                        :id="renderTitleId(item)">{{ item.content.trim().replace(/#/g, "") }}</h2>
                </template>
                <template v-else-if="item.type === 'h3'">
                    <h3 :class="`md_${item.type} my-4 scroll-m-20 text-2xl font-semibold tracking-tight`"
                        :id="renderTitleId(item)">{{ item.content.trim().replace(/#/g, "") }}</h3>
                </template>
                <template v-else-if="item.type === 'h4'">
                    <h4 :class="`md_${item.type} my-2 scroll-m-20 text-xl font-semibold tracking-tight`"
                        :id="renderTitleId(item)">{{ item.content.trim().replace(/#/g, "") }}</h4>
                </template>
                <template v-else-if="item.type === 'h5'">
                    <h5 :class="`md_${item.type} my-2 scroll-m-20 text-lg font-semibold tracking-tight`"
                        :id="renderTitleId(item)">{{ item.content.trim().replace(/#/g, "") }}</h5>
                </template>
                <template v-else-if="item.type === 'h6'">
                    <h6 :class="`md_${item.type} my-2 scroll-m-20 text-lg font-semibold tracking-tight`"
                        :id="renderTitleId(item)">{{ item.content.trim().replace(/#/g, "") }}</h6>
                </template>
                <template v-else-if="item.type === 'divider'">
                    ----------------
                </template>
                <!-- 引用 -->
                <template v-else-if="item.type === 'quote'">
                    <blockquote class="my-4 border-l-4 pl-6 italic">
                        <p class="text-4 leading-8 my-2" v-html="item.content"></p>
                    </blockquote>
                </template>
                <!-- 超链接 -->
                <template v-else-if="item.type === 'link'">
                    <Tooltip :content="item.content[2]">
                        <Button class="px-0 py-0 font-bold" variant="link" @click="openTab(item.content[2])">
                            <LinkIcon class="inline-block size-4" />
                            {{ item.content[1] }}
                        </Button>
                    </Tooltip>
                </template>
                <!-- 图片 -->
                <template v-else-if="item.type === 'img'">
                    <div class="my-4 w-full flex flex-col justify-center items-center">
                        <img :src="getImageUrl(item.content[2])" alt="" class="h-auto rounded-md">
                        <p class="my-2" :title="item.content[1]">{{ item.content[1] }}</p>
                    </div>
                </template>
                <!-- 无序列表 -->
                <template v-else-if="item.type === 'unorderList'">
                    <div class="flex justify-start items-center my-2">
                        <Badge class="size-2 p-0"></Badge>
                        <span class="text-4 ml-2" v-html="item.content"></span>
                    </div>
                </template>
                <!-- 有序列表 -->
                <template v-else-if="item.type === 'orderList'">
                    <div class="flex justify-start items-center my-2">
                        <Badge class="size-4 p-0">
                            {{ item.content[0] }}
                        </Badge>
                        <span class="text-4 ml-2" v-html="item.content[1]"></span>
                    </div>
                </template>
                <!-- 待办事项 -->
                <template v-else-if="item.type === 'todo'">
                    <p v-for="(t, t_index) in item.content" :key="'todo' + t_index">
                        <n-checkbox :checked="t.finished">
                            {{ t.label }}
                        </n-checkbox>
                    </p>
                </template>
                <!-- 代码片段 -->
                <template v-else-if="item.type === 'code'">
                    <pre class="my-4 rounded bg-muted text-sm font-semibold">
                        <code>{{ renderCode(item.content) }}</code>
                    </pre>
                </template>
                <template v-else-if="item.type === 'text'">
                    <p class="text-4 leading-8" v-html="item.content"></p>
                </template>
                <template v-else>
                    <p>{{ item.content }}</p>
                </template>
            </template>
        </ScrollArea>
        <!-- 目录 -->
        <div class="absolute top-2 right-2">
            <Card class="w-[300px] gap-4 py-4">
                <CardHeader>
                    <CardTitle>文章目录</CardTitle>
                    <CardDescription>
                        共 <span class="text-sm font-bold">{{ markdownNavCount }}</span> 个章节
                    </CardDescription>
                    <CardAction>
                        <Tooltip :content="guideVisible ? '收起目录' : '展开目录'">
                            <Button size="sm" variant="secondary" @click="toggleGuideVisible">
                                <ChevronsUpIcon class="size-4" v-if="guideVisible" />
                                <ChevronsDownIcon class="size-4" v-else />
                            </Button>
                        </Tooltip>
                    </CardAction>
                </CardHeader>
                <CardContent class="mh-[400px] overflow-hidden" v-show="guideVisible">
                    <Tree :data="markdown_nav" v-model:currentKey="currentNavKey" />
                </CardContent>
            </Card>
        </div>
        <!-- 文档信息 -->
        <div class="absolute bottom-2 right-2 p-2 border text-xs rounded-md bg-muted">
            <p class="flex items-center mb-2">
                <FileClockIcon class="size-4 mr-2" />
                最后修改时间：{{ markdownInfo.lastModified || '-' }}
            </p>
            <p class="flex items-center">
                <NewspaperIcon class="size-4 mr-2" />
                全文字数统计：{{ articelTextTotal }}
            </p>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>