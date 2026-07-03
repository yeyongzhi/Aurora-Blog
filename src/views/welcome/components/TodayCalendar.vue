<script setup lang="ts" name="TodayCalendar">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { CalendarCheckIcon, CalendarDaysIcon, ClockIcon } from 'lucide-vue-next'
import type { DateValue } from '@internationalized/date'
import { CalendarDate, getLocalTimeZone, today as getToday } from '@internationalized/date'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'

const todayValue = getToday(getLocalTimeZone())
const selectedDate = shallowRef<CalendarDate>(todayValue)
const currentTime = ref(new Date())
const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
let timer: any = null

const toCalendarDate = (date: DateValue) => new CalendarDate(date.year, date.month, date.day)
const toNativeDate = (date: CalendarDate) => new Date(date.year, date.month - 1, date.day)
const getWeekText = (date: CalendarDate) => weekMap[toNativeDate(date).getDay()] ?? ''

const todayInfo = computed(() => ({
    year: selectedDate.value.year,
    month: selectedDate.value.month,
    date: selectedDate.value.day,
    week: getWeekText(selectedDate.value),
}))
const calendarValue = computed<DateValue>({
    get: () => selectedDate.value,
    set: date => {
        selectedDate.value = toCalendarDate(date)
    },
})
const currentTimeText = computed(() => currentTime.value.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
}))

const todayMetaList = computed(() => [
    {
        label: '日期',
        value: `${todayInfo.value.month} 月 ${todayInfo.value.date} 日`,
        icon: CalendarCheckIcon,
    },
    {
        label: '星期',
        value: todayInfo.value.week,
        icon: CalendarDaysIcon,
    },
    {
        label: '当前时间',
        value: currentTimeText.value,
        icon: ClockIcon,
    },
])

const isSelectedToday = computed(() => selectedDate.value.compare(todayValue) === 0)
const getCalendarTitle = (date: Pick<DateValue, 'year' | 'month'>) => `${date.year} 年 ${date.month} 月`

const handleBackToday = () => {
    selectedDate.value = todayValue
}

onMounted(() => {
    timer = window.setInterval(() => {
        currentTime.value = new Date()
    }, 1000)
})

onBeforeUnmount(() => {
    if (timer) {
        window.clearInterval(timer)
    }
})
</script>

<template>
    <Card class="rounded-lg">
        <CardHeader>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <CalendarDaysIcon class="size-4" />
                        今日日历
                    </CardTitle>
                    <CardDescription>
                        {{ todayInfo.year }} 年 {{ todayInfo.month }} 月
                    </CardDescription>
                </div>
                <Button variant="outline" :disabled="isSelectedToday" @click="handleBackToday">
                    回到今天
                </Button>
            </div>
        </CardHeader>
        <CardContent class="grid grid-cols-[minmax(200px,0.8fr)_minmax(320px,1.2fr)] items-stretch gap-4">
            <div class="grid h-full gap-4">
                <div class="flex min-h-[150px] flex-col justify-between rounded-lg border p-4">
                    <p class="text-sm text-muted-foreground">{{ todayInfo.week }}</p>
                    <strong class="mt-2 block text-5xl leading-none">{{ todayInfo.date }}</strong>
                    <span class="mt-2 block text-sm text-muted-foreground">
                        {{ todayInfo.year }} / {{ todayInfo.month }}
                    </span>
                </div>
                <div class="grid gap-3">
                    <div v-for="item in todayMetaList" :key="item.label" class="flex items-center gap-4 rounded-lg border px-4 py-2">
                        <component :is="item.icon" class="size-4 text-muted-foreground" />
                        <span class="text-sm text-muted-foreground">{{ item.label }}</span>
                        <strong class="ml-auto text-sm">{{ item.value }}</strong>
                    </div>
                </div>
            </div>
            <Calendar
                v-model:value="calendarValue"
                locale="zh-CN"
                fixed-weeks
                class="flex h-full w-full flex-col rounded-lg border [&_[data-slot=calendar-cell-trigger]]:h-9 [&_[data-slot=calendar-cell-trigger]]:w-full"
            >
                <template #calendar-heading="{ date }">
                    <div class="text-center text-sm font-medium mt-1">
                        {{ getCalendarTitle(date) }}
                    </div>
                </template>
            </Calendar>
        </CardContent>
    </Card>
</template>
