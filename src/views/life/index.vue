<script setup lang="ts" name="Life">
import { onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronsRightIcon } from 'lucide-vue-next'
import ArticleSlideMenu from '@/components/self/ArticleSlideMenu/index.vue'
import Tree from '@/components/self/Tree/index.vue'
import MarkDown from '@/components/self/MarkDown/index.vue'
import { getFullPath, getMdPath, findTreeNodeByPath } from '@/utils/index'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { type NoteTreeItem } from '@/types/Note'
import { getFetchData } from '@/utils/index'
import useAppStore from '@/store/app'

const appStore = useAppStore()
const BASE_ARTICLE_PATH = '/article/life'

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
        const data = await getFetchData('/life.json')
        treeData.value = data

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
        console.error('获取生活笔记目录失败:', error)
    }
}

watch(
    () => appStore.articlePath,
    (newPath) => {
        if (!treeData.value.length) return
        if (appStore.menuKey !== 'life') return

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

watch(noteKey, (newKey) => {
    if (newKey && newKey !== "") {
        const fullPath = getFullPath(treeData.value, newKey)
        const mdPath = getMdPath(BASE_ARTICLE_PATH, fullPath)
        mdFilePath.value = mdPath

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
    <div class="w-full h-full p-4 flex justify-center gap-x-4">
        <ArticleSlideMenu v-show="slideMenuVisible" :visible="slideMenuVisible" @toggle="toggleSlideMenu" :treeData="treeData">
            <Tree v-model:currentKey="noteKey" :data="treeData" @articleChanged="handleArticleChanged" />
        </ArticleSlideMenu>
        <div class="border flex-1 rounded-xl p-4">
            <div class="mb-4" v-if="!slideMenuVisible" >
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button size="sm" variant="secondary" @click="toggleSlideMenu">
                                <ChevronsRightIcon class="size-4"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            展开菜单
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <MarkDown :path="mdFilePath" :showInfo="false" />
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
