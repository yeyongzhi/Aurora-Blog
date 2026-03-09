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
        <div class="w-full px-[25%] mt-4">
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-5xl font-extrabold">{{ uesrData.name }}</p>
                    <p class="text-3xl font-extrabold mt-8 typewriter">{{ uesrData.signature }}</p>
                </div>
                <img src="../../assets/images/user/logo.png" alt="logo" class="size-[350px] avatar-animation"/>
            </div>
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

<style scoped lang="scss">
.avatar-animation {
    border-radius: 50%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: float 3s ease-in-out infinite;
    cursor: pointer;

    &:hover {
        transform: scale(1.1) rotateY(15deg) rotateX(-10deg);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        animation-play-state: paused;
    }

    &:active {
        transform: scale(0.95) rotateY(15deg) rotateX(-10deg);
    }
}

@keyframes float {
    0%, 100% {
        transform: translateY(10px);
    }
    50% {
        transform: translateY(-10px);
    }
}

.typewriter {
    overflow: hidden;
    white-space: nowrap;
    border-right: 3px solid currentColor;
    animation: typing 2s steps(20, end) 1s forwards, blink 0.75s step-end infinite;
    width: 0;
    max-width: 100%;
}

@keyframes typing {
    from {
        width: 0;
    }
    to {
        width: 100%;
    }
}

@keyframes blink {
    from, to {
        border-color: transparent;
    }
    50% {
        border-color: currentColor;
    }
}
</style>
