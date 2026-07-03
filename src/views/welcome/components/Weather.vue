<script setup lang="ts" name="Weather">
import { computed, onMounted } from 'vue'
import { CloudSunIcon, DropletsIcon, MapPinIcon, RefreshCwIcon, SunriseIcon, SunsetIcon, ThermometerIcon, WindIcon } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useWeather } from '@/composables/useWeather'

const {
    city,
    weatherLoading,
    weatherError,
    currentWeather,
    nearestArea,
    weatherDays,
    fetchWeather,
} = useWeather('杭州', 'zh')

const getWeatherDesc = () => currentWeather.value?.weatherDesc?.[0]?.value || '暂无天气描述'
const getAreaName = () => nearestArea.value?.areaName?.[0]?.value || city.value
const getAstronomy = (type: 'sunrise' | 'sunset') => weatherDays.value[0]?.astronomy?.[0]?.[type] || '--'
const weatherMetricList = computed(() => [
    {
        label: '体感温度',
        value: `${currentWeather.value?.FeelsLikeC || '--'} °C`,
        icon: ThermometerIcon,
    },
    {
        label: '空气湿度',
        value: `${currentWeather.value?.humidity || '--'}%`,
        icon: DropletsIcon,
    },
    {
        label: '风速',
        value: `${currentWeather.value?.windspeedKmph || '--'} 千米/小时`,
        icon: WindIcon,
    },
])
const astronomyList = computed(() => [
    {
        label: '日出',
        value: getAstronomy('sunrise'),
        icon: SunriseIcon,
    },
    {
        label: '日落',
        value: getAstronomy('sunset'),
        icon: SunsetIcon,
    },
])
const forecastList = computed(() => weatherDays.value.slice(0, 3).map((item) => ({
    date: item.date,
    temperature: `${item.mintempC}°C / ${item.maxtempC}°C`,
    average: `平均 ${item.avgtempC}°C`,
})))

onMounted(() => {
    fetchWeather()
})
</script>

<template>
    <Card class="rounded-lg">
        <CardHeader>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <CardTitle class="flex items-center gap-2 text-xl">
                        <CloudSunIcon class="size-4" />
                        今日天气
                    </CardTitle>
                    <CardDescription class="flex items-center gap-1">
                        <MapPinIcon class="size-4" />
                        {{ getAreaName() }}
                    </CardDescription>
                </div>
                <Button variant="outline" size="icon-sm" :disabled="weatherLoading" @click="fetchWeather()">
                    <RefreshCwIcon :class="`size-4 ${weatherLoading ? 'animate-spin' : ''}`" />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div v-if="weatherError" class="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {{ weatherError }}
            </div>
            <div v-else-if="weatherLoading && !currentWeather" class="grid gap-3">
                <div class="h-8 w-32 rounded-md bg-muted" />
                <div class="h-20 rounded-lg bg-muted" />
                <div class="grid grid-cols-3 gap-3">
                    <div v-for="item in 3" :key="item" class="h-16 rounded-lg bg-muted" />
                </div>
            </div>
            <div v-else class="grid gap-4">
                <div class="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div class="flex items-start gap-2">
                            <strong class="text-5xl leading-none">{{ currentWeather?.temp_C || '--' }}</strong>
                            <span class="mt-1 text-lg text-muted-foreground">°C</span>
                        </div>
                        <p class="mt-2 text-sm text-muted-foreground">{{ getWeatherDesc() }}</p>
                    </div>
                    <Badge
                        as="a"
                        href="https://github.com/chubin/wttr.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="secondary"
                    >
                        wttr.in 实时数据
                    </Badge>
                </div>

                <div class="grid grid-cols-3 gap-x-4">
                    <div v-for="item in weatherMetricList" :key="item.label" class="rounded-lg border p-4">
                        <component :is="item.icon" class="mb-2 size-4 text-muted-foreground" />
                        <p class="text-sm text-muted-foreground">{{ item.label }}</p>
                        <strong>{{ item.value }}</strong>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-x-4">
                    <div v-for="item in astronomyList" :key="item.label" class="flex items-center gap-2 rounded-lg border p-4">
                        <component :is="item.icon" class="size-4 text-muted-foreground" />
                        <span class="text-muted-foreground">{{ item.label }}</span>
                        <strong class="ml-auto">{{ item.value }}</strong>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-x-4">
                    <div v-for="item in forecastList" :key="item.date" class="rounded-lg border p-4">
                        <p class="text-sm text-muted-foreground">{{ item.date }}</p>
                        <strong class="mt-1 block">{{ item.temperature }}</strong>
                        <span class="text-sm text-muted-foreground">{{ item.average }}</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
