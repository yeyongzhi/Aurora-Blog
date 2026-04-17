<script setup lang="ts" name="DateTime">
import { ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'

const date = ref("")
const time = ref("")
const weekday = ref("")

const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

let interval: any = null

const initDateTime = () => {
    date.value = dayjs().format('YYYY-MM-DD')
    time.value = dayjs().format('HH:mm:ss')
    weekday.value = weekdayMap[dayjs().day()] || ''
}

onMounted(() => {
    initDateTime()
    interval = setInterval(() => {
        initDateTime()
    }, 1000)
})

onUnmounted(() => {
    clearInterval(interval)
})

</script>

<template>
    <div class="flex justify-center items-center gap-x-4">
        <div class="text-sm text-gray-500">
            {{ date }}
        </div>
        <div class="text-sm text-gray-500">
            {{ weekday }}
        </div>
        <div class="text-sm text-gray-500">
            {{ time }}
        </div>
    </div>
</template>

<style scoped lang="scss">

</style>
