<script setup lang="ts" name="Home">
import { onMounted, ref, computed } from 'vue';
import TechStack from './components/TechStack.vue';
import PersonalWorks from './components/PersonalWorks.vue';
import Knowledge from './components/Knowledge.vue';
import AboutMe from './components/AboutMe.vue';

const uesrData = ref<any>(null)

const techStackData = computed(() => {
    return uesrData.value?.techStack || []
})

const personalWorksData = computed(() => {
    return uesrData.value?.personalWorks || []
})

const knowledgeData = computed(() => {
    return uesrData.value?.knowledge || []
})

onMounted(() => {
    fetch('/user.json')
        .then(response => response.json())
        .then(data => {
            uesrData.value = data
        })
})

</script>

<template>
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
</template>

<style scoped lang="scss"></style>
