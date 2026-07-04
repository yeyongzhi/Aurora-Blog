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

    const fetchQuote = async () => {
        loading.value = true

        try {
            const response = await fetch(QUOTE_API)
            quote.value = await response.json()
        } finally {
            loading.value = false
        }
    }

    return {
        quote,
        loading,
        fetchQuote,
    }
}
