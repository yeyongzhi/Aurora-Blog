<script setup lang="ts" name="Think">
import { onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronsRightIcon } from 'lucide-vue-next'
import ArticleSlideMenu from '@/components/self/ArticleSlideMenu/index.vue'
import Tree from '@/components/self/Tree/index.vue'
import MarkDown from '@/components/self/MarkDown/index.vue'
import { getFullPath, getMdPath } from '@/utils/index'
import Tooltip from '@/components/self/Tooltip/index.vue'
import Empty from '@/components/self/Empty/index.vue'
import { type NoteTreeItem } from '@/types/Note'
import { getFetchData } from '@/utils/index'

const BASE_ARTICLE_PATH = '/article/think'

const treeData = ref<NoteTreeItem[]>([])
const noteKey = ref<string>('')
const articlePath = ref<string>('')

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
        const data = await getFetchData('/think.json')
        treeData.value = data
        findDefaultArticle(treeData.value)
    } catch (error) {
        console.error('获取思考目录失败:', error)
    }
}

watch(noteKey, (newKey) => {
    if (newKey && newKey !== "") {
        const fullPath = getFullPath(treeData.value, newKey)
        const mdPath = getMdPath(BASE_ARTICLE_PATH, fullPath)
        articlePath.value = mdPath
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
        <ArticleSlideMenu v-show="slideMenuVisible" :visible="slideMenuVisible" @toggle="toggleSlideMenu"
            :treeData="treeData">
            <Tree v-model:currentKey="noteKey" :data="treeData" @articleChanged="handleArticleChanged" />
        </ArticleSlideMenu>
        <div class="border flex-1 rounded-xl p-4">
            <div class="mb-4" v-if="!slideMenuVisible">
                <Tooltip content="展开菜单">
                    <Button size="sm" variant="secondary" @click="toggleSlideMenu">
                        <ChevronsRightIcon class="size-4" />
                    </Button>
                </Tooltip>
            </div>
            <MarkDown v-if="articlePath && articlePath !== ''" :path="articlePath" :showInfo="false" />
            <Empty v-else description="这里啥也没有"/>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
