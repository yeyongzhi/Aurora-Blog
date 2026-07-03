<script setup lang="ts" name="Welcome">
import useAppStore from '@/store/app'
import { ScrollArea } from '@/components/ui/scroll-area'
import WelcomeHero from './components/WelcomeHero.vue'
import TodayCalendar from './components/TodayCalendar.vue'
import Weather from './components/Weather.vue'
import WritingHeatmap from './components/WritingHeatmap.vue'
// import WelcomeModuleGrid from './components/WelcomeModuleGrid.vue'
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
        <div class="w-full px-[10%] mt-4 flex flex-col gap-8">
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
            <div class="grid grid-cols-2 gap-8 max-xl:grid-cols-1">
                <WritingHeatmap />
                <FeaturedContent />
            </div>
            <!-- <WelcomeModuleGrid /> -->
            <!-- <WelcomeQuickStart /> -->
        </div>
    </ScrollArea>
</template>
