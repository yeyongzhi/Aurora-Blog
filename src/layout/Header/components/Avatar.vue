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

</script>

<template>
    <div class="flex justify-center items-center gap-x-4">
        <img class="size-10 rounded-full" :src="AvatarImg" />
        <div class="font-bold text-base">{{ user.name }}</div>
        <div class="flex justify-center items-center gap-x-2">
            <Tooltip content="刷新">
                <Button size="sm" variant="secondary" @click="appStore.handleRefresh">
                    <RefreshCcwIcon />
                </Button>
            </Tooltip>
            <Tooltip content="上一级">
                <Button size="sm" variant="secondary" @click="appStore.handleBack">
                    <ArrowLeftToLineIcon />
                </Button>
            </Tooltip>
            <Tooltip content="下一级">
                <Button size="sm" variant="secondary" @click="appStore.handleForward">
                    <ArrowRightToLineIcon />
                </Button>
            </Tooltip>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
