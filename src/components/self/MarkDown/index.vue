<script setup lang="ts" name="MarkDown">
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area';
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { formatMarkDown } from '@/utils/markdown'
import message from '@/plugins/message'
import { openTab, getMarkDownContent, scrollToTop, getArticleTextCount, getMarkDownInfo } from '@/utils/index'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { FileClockIcon, NewspaperIcon } from 'lucide-vue-next'

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

const selectTitleLevel = ref("")
const handleNavClick = ({ option }: { option: any }) => {
    selectTitleLevel.value = option.type
    location.hash = `#${option.name}`
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
            console.log(markdownInfo.value)
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

const scrollToSection = () => {
    const decodedHash = decodeURIComponent(location.hash.substring(1));
    // const elements = document.getElementsByTagName(selectTitleLevel.value)
    // console.log(elements)
    const element = document.getElementById('markdown_nav_' + decodedHash);
    if (element) {
        // 滚动到元素位置，并预留顶部间距
        window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 65 - 30, // 50为顶部间距
            behavior: 'smooth'
        });
    }
}

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
    console.log('First line:', JSON.stringify(content[0]))
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
        <ScrollArea class="w-full h-full text-4" v-else>
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
                    <blockquote class="mt-6 border-l-2 pl-6 italic">
                        <p class="text-4 leading-8 my-2" v-html="item.content"></p>
                    </blockquote>
                </template>
                <!-- 超链接 -->
                <template v-else-if="item.type === 'link'">
                    <!-- <a :href="item.content[2]">{{ item.content[1] }}</a> -->
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <span @click="openTab(item.content[2])">
                                {{ item.content[1] }}
                            </span>
                        </template>
                        👇点击前往
                    </n-tooltip>
                </template>
                <!-- 图片 -->
                <template v-else-if="item.type === 'img'">
                    <div class="single_img">
                        
                        <p :title="item.content[1]">{{ item.content[1] }}</p>
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