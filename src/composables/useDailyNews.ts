import { fetchJson } from '@/utils/request'
import { ref } from 'vue'

export interface DailyNewsItem {
    date: string
    news: string[]
    cover: string
    tip: string
    image: string
    link: string
    day_of_week: string
    lunar_date: string
}

export interface AiNewsItem {
    date: string
    news: {
        title: string
        detail: string
        link: string
        source: string
        date: string
    }[]
    tip?: string
    day_of_week?: string
    lunar_date?: string
}

interface DailyNewsResponse {
    code: number
    message: string
    data: DailyNewsItem
}

interface AiNewsResponse {
    code: number
    message: string
    data: AiNewsItem
}

const BASE_URL = 'https://60s.viki.moe/v2'
const IMAGE_URL = 'https://60s.viki.moe/v2/60s?encoding=image'

export function useDailyNews(path: '60s' | 'ai-news' = '60s') {
    const newsData = ref<DailyNewsItem | null>(null)
    const aiNewsData = ref<AiNewsItem | null>(null)
    const loading = ref(false)
    const error = ref('')
    const imageDialogOpen = ref(false)

    const fetchNews = async (date?: string) => {
        loading.value = true
        error.value = ''

        try {
            const url = date ? `${BASE_URL}/${path}?date=${date}` : `${BASE_URL}/${path}`
            const response = await fetchJson<DailyNewsResponse | AiNewsResponse>(url)

            if (!Array.isArray(response?.data?.news)) throw new Error('新闻数据格式无效')
            if (path === 'ai-news') {
                const result = response as AiNewsResponse
                aiNewsData.value = result.data
            } else {
                const result = response as DailyNewsResponse
                newsData.value = result.data
            }
        } catch (cause) {
            error.value = cause instanceof Error ? cause.message : '数据加载失败'
        } finally {
            loading.value = false
        }
    }

    const openImageViewer = () => {
        imageDialogOpen.value = true
    }

    const closeImageViewer = () => {
        imageDialogOpen.value = false
    }

    return {
        newsData,
        aiNewsData,
        loading,
        error,
        fetchNews,
        imageDialogOpen,
        imageUrl: IMAGE_URL,
        openImageViewer,
        closeImageViewer,
    }
}
