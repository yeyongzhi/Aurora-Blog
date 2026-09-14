<script setup lang="ts" name="Content">
import { onMounted } from 'vue'
import { Button } from '@/components/ui/button'
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
        <div v-if="userStore.userError" role="status" class="flex items-center gap-2 p-2 text-sm">
            {{ userStore.userError }}
            <Button variant="outline" size="sm" @click="userStore.getUserData">重试</Button>
        </div>
        <component :is="appStore.currentMenuComponent" />
    </div>
</template>

<style scoped lang="scss"></style>
