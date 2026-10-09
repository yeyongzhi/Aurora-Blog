<script setup lang="ts" name="Welcome">
import useAppStore from '@/store/app'
import { ScrollArea } from '@/components/ui/scroll-area'
import WelcomeHero from './components/WelcomeHero.vue'
import TodayCalendar from './components/TodayCalendar.vue'
import Weather from './components/Weather.vue'
import WritingHeatmap from './components/WritingHeatmap.vue'
import TodayPoetry from './components/TodayPoetry.vue'
import QuoteCard from './components/QuoteCard.vue'
import DailyNews from './components/DailyNews.vue'
import AiNews from './components/AiNews.vue'
import TodayInHistory from './components/TodayInHistory.vue'
import FeaturedContent from './components/FeaturedContent.vue'

const appStore = useAppStore()

const goNav = () => {
    appStore.handleMenuChange('home')
}

const goNotes = () => {
    appStore.handleMenuChange('note')
}
</script>

<template>
    <ScrollArea class="w-full h-full p-4">
        <div class="mx-auto w-full max-w-[1600px] mt-4 flex flex-col gap-6 sm:px-4 xl:px-[5%]">
            <WelcomeHero
                title="欢迎来到 Aurora Blog"
                subtitle="这是一个可以承载站点导览、最新内容、个人动态和精选作品的起始页面。"
                @explore="goNav"
                @view-notes="goNotes"
            />
            <div class="grid grid-cols-2 gap-8 max-xl:grid-cols-1">
                <TodayCalendar />
                <Weather />
            </div>
            <div class="grid grid-cols-2 gap-8 max-xl:grid-cols-1 xl:h-[500px] xl:overflow-hidden max-xl:[&>*]:min-h-[400px]">
                <WritingHeatmap />
                <FeaturedContent />
            </div>
            <div class="grid grid-cols-2 gap-8 max-xl:grid-cols-1 xl:h-[460px] xl:overflow-hidden max-xl:[&>*]:min-h-[400px]">
                <div class="flex flex-col gap-8 h-full overflow-hidden">
                    <TodayPoetry class="flex-1" />
                    <QuoteCard class="flex-1" />
                </div>
                <DailyNews />
            </div>
            <div class="grid grid-cols-2 gap-8 max-xl:grid-cols-1 xl:h-[400px] xl:overflow-hidden max-xl:[&>*]:min-h-[400px]">
                <AiNews />
                <TodayInHistory />
            </div>
        </div>
    </ScrollArea>
</template>
