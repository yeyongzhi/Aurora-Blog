import { fetchJson } from '@/utils/request'
import { ref } from 'vue'

export interface PoetryItem {
    content: string
    origin: string
    author: string
    category: string
}

const POETRY_API = 'https://v1.jinrishici.com/all.json'

export function usePoetry() {
    const poetry = ref<PoetryItem | null>(null)
    const loading = ref(false)
    const error = ref('')

    const fetchPoetry = async () => {
        loading.value = true
        error.value = ''

        try {
            const response = await fetchJson<PoetryItem>(POETRY_API)
            if (typeof response?.content !== 'string') throw new Error('诗词数据格式无效')
            poetry.value = response
        } catch (cause) {
            error.value = cause instanceof Error ? cause.message : '数据加载失败'
        } finally {
            loading.value = false
        }
    }

    return {
        poetry,
        loading,
        error,
        fetchPoetry,
    }
}
