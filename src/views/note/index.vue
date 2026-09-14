<script setup lang="ts" name="Note">
import { useArticleCollection } from '@/composables/useArticleCollection'
import { Button } from '@/components/ui/button'
import { ChevronsRightIcon } from 'lucide-vue-next'
import NoteSlideMenu from './components/SlideMenu.vue'
import Tree from './components/Tree.vue'
import MarkDown from '@/components/self/MarkDown/index.vue'
import Tooltip from '@/components/self/Tooltip/index.vue'

export interface NoteTreeItem {
    key: string
    label: string
    default?: boolean
    children?: Array<NoteTreeItem>
}

const { articleMissing, treeData, noteKey, mdFilePath, treeError, treeLoading, initTreeData, handleArticleChanged, slideMenuVisible, toggleSlideMenu } = useArticleCollection('note')

</script>

<template>
    <div class="w-full h-full p-2 sm:p-4 flex flex-col lg:flex-row gap-4 overflow-hidden">
        <NoteSlideMenu v-show="slideMenuVisible" :visible="slideMenuVisible" @toggle="toggleSlideMenu"
            :treeData="treeData">
            <Tree :currentKey="noteKey" :data="treeData" @articleChanged="handleArticleChanged" />
        </NoteSlideMenu>
        <div class="border flex flex-col min-w-0 min-h-0 flex-1 rounded-xl p-2 sm:p-4 bg-card">
            <div class="mb-4" v-if="!slideMenuVisible">
                    <Tooltip content="展开菜单">
                        <Button size="sm" variant="secondary" aria-label="展开文章菜单" @click="toggleSlideMenu">
                            <ChevronsRightIcon class="size-4" />
                        </Button>
                    </Tooltip>
            </div>
            <div v-if="treeError" role="alert" class="flex items-center gap-2">{{ treeError }}<Button variant="outline" @click="initTreeData">重试</Button></div>
            <p v-if="treeLoading" role="status">目录加载中...</p>
            <div v-if="articleMissing" role="alert" class="p-6 flex flex-col gap-3"><h2 class="text-lg font-semibold">文章不存在或尚未发布</h2><p>请从目录选择其他文章，或使用顶部搜索。</p></div>
            <MarkDown v-else class="min-h-0 flex-1 !h-auto" :path="mdFilePath" />
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
