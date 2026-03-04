<script setup lang="ts" name="Home">
import {ref, computed } from 'vue';
import useUserStore from '@/store/user';
import TechStack from './components/TechStack.vue';
import PersonalWorks from './components/PersonalWorks.vue';
import Knowledge from './components/Knowledge.vue';
import AboutMe from './components/AboutMe.vue';
import { ScrollArea } from '@/components/ui/scroll-area'

const userStore = useUserStore()

const uesrData = computed(() => {
    return userStore.userInfo || {
        techStack: [],
        personalWorks: [],
        knowledge: [],
    }
})

const techStackData = computed(() => {
    return uesrData.value.techStack || []
})

const personalWorksData = computed(() => {
    return uesrData.value?.personalWorks || []
})

const knowledgeData = computed(() => {
    return uesrData.value?.knowledge || []
})

</script>

<template>
    <ScrollArea class="w-full h-full p-4">
        <div class="w-full px-[25%]">
            <h1 class="text-2xl font-extrabold">关于我</h1>
            <AboutMe :data="uesrData" />
            <h1 class="text-2xl font-extrabold">技术栈</h1>
            <TechStack :data="techStackData" />
            <h1 class="text-2xl font-extrabold">知识库</h1>
            <Knowledge :data="knowledgeData" />
            <h1 class="text-2xl font-extrabold">个人作品</h1>
            <PersonalWorks :data="personalWorksData" />
        </div>
    </ScrollArea>
</template>

<style scoped lang="scss"></style>
