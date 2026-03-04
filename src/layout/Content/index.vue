<script setup lang="ts" name="Content">
import { onMounted } from 'vue'
import Loading from '@/components/self/Loading/index.vue'
import useAppStore from '@/store/app'
import useUserStore from '@/store/user'

const appStore = useAppStore()

const userStore = useUserStore()

onMounted(() => {
    userStore.getUserData()
})

</script>

<template>
    <div class="w-full flex-1 overflow-hidden">
        <div class="w-full h-full flex justify-center items-center" v-if="userStore.userLoading">
            <Loading description="加载中..."/>
        </div>
        <component v-else :is="appStore.currentMenuComponent" />
    </div>
</template>

<style scoped lang="scss"></style>
