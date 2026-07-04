<script setup lang="ts" name="Note">
import { onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronsRightIcon } from 'lucide-vue-next'
import NoteSlideMenu from './components/SlideMenu.vue'
import Tree from './components/Tree.vue'
import MarkDown from '@/components/self/MarkDown/index.vue'
import { getFullPath, getMdPath, findTreeNodeByPath } from '@/utils/index'
import Tooltip from '@/components/self/Tooltip/index.vue'
import { getFetchData } from '@/utils/index'
import useAppStore from '@/store/app'

export interface NoteTreeItem {
    key: string
    label: string
    default?: boolean
    children?: Array<NoteTreeItem>
}

const appStore = useAppStore()
const treeData = ref<NoteTreeItem[]>([])
const noteKey = ref<string>('')
const mdFilePath = ref<string>('')

const findDefaultArticle = (data: Array<NoteTreeItem>) => {
    data.forEach((item) => {
        if (item.children && item.children.length > 0) {
            findDefaultArticle(item.children)
        } else {
            if (item.default) {
                noteKey.value = item.key
            }
        }
    })
}

const initTreeData = async () => {
    try {
        const data = await getFetchData('/note.json')
        treeData.value = data

        // 优先从 URL 解析文章路径，否则加载默认文章
        const urlArticlePath = appStore.articlePath
        if (urlArticlePath) {
            const node = findTreeNodeByPath(treeData.value, urlArticlePath)
            if (node) {
                noteKey.value = node.key
                return
            }
        }
        findDefaultArticle(treeData.value)
    } catch (error) {
        console.error('获取笔记目录失败:', error)
    }
}

// 监听 URL 中的文章路径变化（浏览器前进/后退）
watch(
    () => appStore.articlePath,
    (newPath) => {
        if (!treeData.value.length) return
        if (appStore.menuKey !== 'note') return

        if (newPath) {
            const node = findTreeNodeByPath(treeData.value, newPath)
            if (node) {
                noteKey.value = node.key
            } else {
                findDefaultArticle(treeData.value)
            }
        } else {
            findDefaultArticle(treeData.value)
        }
    },
)

// 监听用户点击文章 → 同步 URL
watch(noteKey, (newKey) => {
    if (newKey && newKey !== "") {
        const fullPath = getFullPath(treeData.value, newKey)
        const mdPath = getMdPath('/article/note', fullPath)
        mdFilePath.value = mdPath

        // 仅在 URL 与当前选择不一致时同步（防止循环）
        if (fullPath !== appStore.articlePath) {
            appStore.handleArticleChange(fullPath)
        }
    }
}, { immediate: true })

const slideMenuVisible = ref(true)

const toggleSlideMenu = () => {
    slideMenuVisible.value = !slideMenuVisible.value
}

const handleArticleChanged = (key: string) => {
    noteKey.value = key
}

onMounted(() => {
    initTreeData()
})

</script>

<template>
    <div class="w-full h-full p-4 flex justify-center gap-x-4 overflow-hidden">
        <NoteSlideMenu v-show="slideMenuVisible" :visible="slideMenuVisible" @toggle="toggleSlideMenu"
            :treeData="treeData">
            <Tree :currentKey="noteKey" :data="treeData" @articleChanged="handleArticleChanged" />
        </NoteSlideMenu>
        <div class="border flex-1 rounded-xl p-4 bg-card">
            <div class="mb-4" v-if="!slideMenuVisible">
                <TooltipProvider>
                    <Tooltip content="展开菜单">
                        <Button size="sm" variant="secondary" @click="toggleSlideMenu">
                            <ChevronsRightIcon class="size-4" />
                        </Button>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <MarkDown :path="mdFilePath" />
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
