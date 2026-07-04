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

    const fetchPoetry = async () => {
        loading.value = true

        try {
            const response = await fetch(POETRY_API)
            poetry.value = await response.json()
        } finally {
            loading.value = false
        }
    }

    return {
        poetry,
        loading,
        fetchPoetry,
    }
}
