<script setup lang="ts" name="Think">
import { useArticleCollection } from '@/composables/useArticleCollection'
import { Button } from '@/components/ui/button'
import { ChevronsRightIcon } from 'lucide-vue-next'
import ArticleSlideMenu from '@/components/self/ArticleSlideMenu/index.vue'
import Tree from '@/components/self/Tree/index.vue'
import MarkDown from '@/components/self/MarkDown/index.vue'
import Tooltip from '@/components/self/Tooltip/index.vue'
import Empty from '@/components/self/Empty/index.vue'

const { articleMissing, treeData, noteKey, mdFilePath, treeError, treeLoading, initTreeData, handleArticleChanged, slideMenuVisible, toggleSlideMenu } = useArticleCollection('think')

</script>

<template>
    <div class="w-full h-full p-2 sm:p-4 flex flex-col lg:flex-row gap-4">
        <ArticleSlideMenu v-show="slideMenuVisible" :visible="slideMenuVisible" @toggle="toggleSlideMenu"
            :treeData="treeData">
            <Tree :currentKey="noteKey" @update:currentKey="handleArticleChanged" :data="treeData" @articleChanged="handleArticleChanged" />
        </ArticleSlideMenu>
        <div class="border flex flex-col min-w-0 min-h-0 flex-1 rounded-xl p-2 sm:p-4">
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
            <MarkDown v-else-if="mdFilePath" class="min-h-0 flex-1 !h-auto" :path="mdFilePath" :showInfo="false" />
            <Empty v-else description="这里啥也没有"/>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
