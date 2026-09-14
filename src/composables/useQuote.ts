import { fetchJson } from '@/utils/request'
import { ref } from 'vue'

export interface QuoteItem {
    id: number
    uuid: string
    hitokoto: string
    type: string
    from: string
    from_who: string | null
    creator: string
    length: number
}

const QUOTE_API = 'https://v1.hitokoto.cn/'

export function useQuote() {
    const quote = ref<QuoteItem | null>(null)
    const loading = ref(false)
    const error = ref('')

    const fetchQuote = async () => {
        loading.value = true
        error.value = ''

        try {
            const response = await fetchJson<QuoteItem>(QUOTE_API)
            if (typeof response?.hitokoto !== 'string') throw new Error('一言数据格式无效')
            quote.value = response
        } catch (cause) {
            error.value = cause instanceof Error ? cause.message : '数据加载失败'
        } finally {
            loading.value = false
        }
    }

    return {
        quote,
        loading,
        error,
        fetchQuote,
    }
}
