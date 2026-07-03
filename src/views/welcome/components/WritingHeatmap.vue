<script setup lang="ts" name="WritingHeatmap">
import { computed, onMounted, ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, FilePenLineIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import Tooltip from '@/components/self/Tooltip/index.vue'
import { getFetchData } from '@/utils'

interface WritingDay {
    date: string
    count: number
    level: number
    articles: ArticleRecord[]
}

interface ArticleRecord {
    path: string
    createdAt: string
    date: string
}

interface DailyRecord {
    date: string
    count: number
    articles: ArticleRecord[]
}

interface WritingHeatmapData {
    generatedAt: string
    source: string
    articles: ArticleRecord[]
    daily: DailyRecord[]
}

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
const today = new Date()
const writingData = ref<WritingHeatmapData | null>(null)
const writingLoading = ref(false)
const writingError = ref('')
const selectedMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

const selectedYear = computed(() => selectedMonth.value.getFullYear())
const selectedMonthIndex = computed(() => selectedMonth.value.getMonth())
const currentMonthTitle = computed(() => `${selectedYear.value} 年 ${selectedMonthIndex.value + 1} 月`)
const currentMonthFirstDay = computed(() => new Date(selectedYear.value, selectedMonthIndex.value, 1))
const currentMonthLastDay = computed(() => new Date(selectedYear.value, selectedMonthIndex.value + 1, 0))
const currentMonthDays = computed(() => currentMonthLastDay.value.getDate())
const isCurrentMonth = computed(() => (
    selectedYear.value === today.getFullYear()
    && selectedMonthIndex.value === today.getMonth()
))

const dailyMap = computed(() => (writingData.value?.daily || []).reduce<Record<string, DailyRecord>>((map, item) => {
    map[item.date] = item
    return map
}, {}))

const getLevel = (count: number) => {
    if (count === 0) {
        return 0
    }

    if (count <= 2) {
        return 1
    }

    if (count <= 4) {
        return 2
    }

    if (count <= 6) {
        return 3
    }

    return 4
}

const monthStartBlankDays = computed(() => Array.from({ length: currentMonthFirstDay.value.getDay() }))
const writingDays = computed(() => Array.from({ length: currentMonthDays.value }, (_, index) => {
    const date = new Date(selectedYear.value, selectedMonthIndex.value, index + 1)
    const dateText = formatDate(date)
    const currentDaily = dailyMap.value[dateText]
    const count = currentDaily?.count || 0

    return {
        date: dateText,
        count,
        level: getLevel(count),
        articles: currentDaily?.articles || [],
    }
}))

const totalWritingCount = computed(() => writingDays.value.reduce((total, item) => total + item.count, 0))
const activeWritingDays = computed(() => writingDays.value.filter((item) => item.count > 0).length)
const maxWritingCount = computed(() => Math.max(...writingDays.value.map((item) => item.count)))
const heatmapClassMap: Record<number, string> = {
    0: 'bg-muted',
    1: 'bg-primary/20',
    2: 'bg-primary/40',
    3: 'bg-primary/70',
    4: 'bg-primary',
}

const summaryList = computed(() => [
    {
        label: '本月文章',
        value: `${totalWritingCount.value} 篇`,
    },
    {
        label: '活跃天数',
        value: `${activeWritingDays.value} 天`,
    },
    {
        label: '单日最高',
        value: `${maxWritingCount.value} 篇`,
    },
])

const getCellTitle = (item: WritingDay) => {
    if (item.count === 0) {
        return `${item.date} 没有写文章`
    }

    const articlePaths = item.articles.map((article) => article.path).join('\n')
    return `${item.date} 写了 ${item.count} 篇文章\n${articlePaths}`
}

const handleMonthChange = (offset: number) => {
    selectedMonth.value = new Date(selectedYear.value, selectedMonthIndex.value + offset, 1)
}

const handleBackToday = () => {
    selectedMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
}

const getWritingData = async () => {
    writingLoading.value = true
    writingError.value = ''

    try {
        writingData.value = await getFetchData('/article/writing-heatmap.json')
    } catch (error) {
        writingError.value = error instanceof Error ? error.message : '写作数据获取失败'
    } finally {
        writingLoading.value = false
    }
}

onMounted(() => {
    getWritingData()
})
</script>

<template>
    <Card class="rounded-lg">
        <CardHeader>
            <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <FilePenLineIcon class="size-4" />
                        月度写作热力图
                    </CardTitle>
                    <CardDescription class="flex items-center gap-1">
                        {{ currentMonthTitle }} 写作记录
                    </CardDescription>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2">
                    <Button variant="outline" size="icon-sm" @click="handleMonthChange(-1)">
                        <ChevronLeftIcon class="size-4" />
                    </Button>
                    <Button variant="secondary" size="sm" :disabled="isCurrentMonth" @click="handleBackToday">
                        本月
                    </Button>
                    <Button variant="outline" size="icon-sm" @click="handleMonthChange(1)">
                        <ChevronRightIcon class="size-4" />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent class="grid gap-4">
            <div v-if="writingError" class="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {{ writingError }}
            </div>

            <div class="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
                <div v-for="item in summaryList" :key="item.label" class="rounded-lg border p-3">
                    <p class="text-sm text-muted-foreground">{{ item.label }}</p>
                    <strong>{{ item.value }}</strong>
                </div>
            </div>

            <div class="rounded-lg border p-3">
                <div class="grid w-full grid-cols-7 gap-1.5">
                    <div v-for="label in weekLabels" :key="label" class="flex h-7 items-center justify-center text-xs text-muted-foreground">
                        {{ label }}
                    </div>

                    <span v-for="(_, index) in monthStartBlankDays" :key="`blank-${index}`" class="h-8 rounded-sm bg-transparent" />
                    <Tooltip
                        v-for="item in writingDays"
                        :key="item.date"
                        :content="getCellTitle(item)"
                    >
                        <span
                            :class="`flex h-8 w-full items-center justify-center rounded-sm text-xs ${heatmapClassMap[item.level]} ${item.level > 2 ? 'text-primary-foreground' : 'text-foreground'}`"
                        >
                            {{ Number(item.date.slice(-2)) }}
                        </span>
                    </Tooltip>
                </div>
            </div>

            <div class="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                <span>少</span>
                <span v-for="level in 5" :key="level" :class="`size-3 rounded-sm ${heatmapClassMap[level - 1]}`" />
                <span>多</span>
            </div>
        </CardContent>
    </Card>
</template>
