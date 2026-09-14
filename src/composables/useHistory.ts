import { fetchJson } from '@/utils/request'
import { ref } from 'vue'

export interface HistoryEvent {
    title: string
    year: string
    description: string
    event_type: 'birth' | 'death' | 'event'
    link: string
}

export interface HistoryData {
    date: string
    month: number
    day: number
    items: HistoryEvent[]
}

interface HistoryResponse {
    code: number
    message: string
    data: HistoryData
}

const HISTORY_API = 'https://60s.viki.moe/v2/today-in-history'

const EVENT_LABEL_MAP: Record<string, string> = {
    birth: '诞辰',
    death: '逝世',
    event: '事件',
}

export function useHistory() {
    const historyData = ref<HistoryData | null>(null)
    const loading = ref(false)
    const error = ref('')

    const fetchHistory = async () => {
        loading.value = true
        error.value = ''

        try {
            const response = await fetchJson<HistoryResponse>(HISTORY_API)
            const result: HistoryResponse = response
            if (!Array.isArray(result?.data?.items)) throw new Error('历史数据格式无效')
            historyData.value = result.data
        } catch (cause) {
            error.value = cause instanceof Error ? cause.message : '数据加载失败'
        } finally {
            loading.value = false
        }
    }

    const getEventLabel = (type: string) => EVENT_LABEL_MAP[type] || type

    return {
        historyData,
        loading,
        error,
        fetchHistory,
        getEventLabel,
    }
}
