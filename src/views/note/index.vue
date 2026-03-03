<script setup lang="ts" name="Note">
import { onMounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronsRightIcon } from 'lucide-vue-next'
import NoteSlideMenu from './components/SlideMenu.vue'
import Tree from './components/Tree.vue'
import MarkDown from '@/components/self/MarkDown/index.vue'
import { getFullPath, getMdPath } from './handle'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export interface NoteTreeItem {
    key: string
    label: string
    default?: boolean
    children?: Array<NoteTreeItem>
}

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

const initTreeData = () => {
    fetch('/note.json')
        .then(response => response.json())
        .then(data => {
            treeData.value = data
            console.log(treeData.value)
            findDefaultArticle(treeData.value)
        })
}

watch(noteKey, (newKey) => {
    if (newKey && newKey !== "") {
        console.log("新的文章key" + newKey)
        const fullPath = getFullPath(treeData.value, newKey)
        console.log("新的文章路径" + fullPath)
        const mdPath = getMdPath(fullPath)
        console.log("新的文章md路径" + mdPath)
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
        <NoteSlideMenu v-show="slideMenuVisible" :visible="slideMenuVisible" @toggle="toggleSlideMenu" :treeData="treeData">
            <Tree :currentKey="noteKey" :data="treeData" @articleChanged="handleArticleChanged" />
        </NoteSlideMenu>
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
            <MarkDown :path="articlePath" />
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
