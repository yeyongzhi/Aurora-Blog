<script setup lang="ts" name="Avatar">
import { computed } from 'vue'
import AvatarImg from '@/assets/images/user/logo.png'
import useUserStore from '@/store/user'
import useAppStore from '@/store/app'
import Tooltip from '@/components/self/Tooltip/index.vue'
import { Button } from '@/components/ui/button'
import { RefreshCcwIcon, ArrowLeftToLineIcon, ArrowRightToLineIcon } from 'lucide-vue-next'

const userStore = useUserStore()
const appStore = useAppStore()

const user = computed(() => {
    return userStore.userInfo || {
        name: '',
    }
})

const goHome = () => {
    appStore.handleMenuChange('home')
}

</script>

<template>
    <div class="flex justify-center items-center gap-x-4">
        <button type="button" aria-label="返回首页" class="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-ring" @click="goHome"><img class="size-10 rounded-full" :src="AvatarImg" alt="Aurora 头像" /></button>
        <div class="font-bold text-base">{{ user.name }}</div>
        <div class="flex justify-center items-center gap-x-2">
            <Tooltip content="刷新">
                <Button size="sm" variant="secondary" aria-label="刷新页面" @click="appStore.handleRefresh">
                    <RefreshCcwIcon />
                </Button>
            </Tooltip>
            <Tooltip content="后退">
                <Button size="sm" variant="secondary" aria-label="后退" @click="appStore.handleBack">
                    <ArrowLeftToLineIcon />
                </Button>
            </Tooltip>
            <Tooltip content="前进">
                <Button size="sm" variant="secondary" aria-label="前进" @click="appStore.handleForward">
                    <ArrowRightToLineIcon />
                </Button>
            </Tooltip>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
