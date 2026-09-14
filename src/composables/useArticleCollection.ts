import { computed, onMounted, ref, watch } from 'vue'
import useAppStore from '@/store/app'
import { getFetchData, getFullPath, getMdPath, findTreeNodeByPath } from '@/utils'
import type { NoteTreeItem } from '@/types/Note'
import { isArticleTree, publishedTree } from '@/utils/articleTree'

export function useArticleCollection(page: string) {
    const appStore = useAppStore()
    const treeData = ref<NoteTreeItem[]>([])
    const noteKey = ref('')
    const treeError = ref('')
    const treeLoading = ref(false)
    const articleMissing = ref(false)
    const mdFilePath = computed(() => noteKey.value ? getMdPath(`/article/${page}`, getFullPath(treeData.value, noteKey.value)) : '')
    const selectFromUrl = () => {
        const node = findTreeNodeByPath(treeData.value, appStore.articlePath)
        const leaves = (nodes: NoteTreeItem[]): NoteTreeItem[] => nodes.flatMap(item => item.children?.length ? leaves(item.children) : [item])
        const articles = leaves(treeData.value)
        articleMissing.value = Boolean(appStore.articlePath && (!node || node.children?.length))
        if (articleMissing.value) { noteKey.value = ''; return }
        noteKey.value = node && !node.children?.length ? node.key : (articles.find(item => item.default) || articles[0])?.key || ''
    }
    const initTreeData = async () => {
        treeLoading.value = true
        treeError.value = ''
        try {
            const data: unknown = await getFetchData(`/${page}.json`)
            if (!isArticleTree(data)) throw new Error('文章目录格式无效')
            treeData.value = publishedTree(data)
            selectFromUrl()
        } catch (cause) { treeError.value = cause instanceof Error ? cause.message : '文章目录加载失败' }
        finally { treeLoading.value = false }
    }
    watch(() => appStore.articlePath, () => { if (appStore.menuKey === page && treeData.value.length) selectFromUrl() })
    const handleArticleChanged = (key: string) => {
        articleMissing.value = false
        noteKey.value = key
        const path = getFullPath(treeData.value, key)
        if (path && path !== appStore.articlePath) appStore.handleArticleChange(path)
    }
    const slideMenuVisible = ref(window.matchMedia('(min-width: 1024px)').matches)
    const toggleSlideMenu = () => { slideMenuVisible.value = !slideMenuVisible.value }
    onMounted(initTreeData)
    return { articleMissing, treeData, noteKey, mdFilePath, treeError, treeLoading, initTreeData, handleArticleChanged, slideMenuVisible, toggleSlideMenu }
}
