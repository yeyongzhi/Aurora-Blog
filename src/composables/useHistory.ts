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

    const fetchHistory = async () => {
        loading.value = true

        try {
            const response = await fetch(HISTORY_API)
            const result: HistoryResponse = await response.json()
            historyData.value = result.data
        } finally {
            loading.value = false
        }
    }

    const getEventLabel = (type: string) => EVENT_LABEL_MAP[type] || type

    return {
        historyData,
        loading,
        fetchHistory,
        getEventLabel,
    }
}
