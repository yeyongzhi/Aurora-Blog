<script setup lang="ts" name="Content">
import useAppStore from '@/store/app'

const appStore = useAppStore()

</script>

<template>
    <div class="w-full flex-1 overflow-hidden">
        <component :is="appStore.currentMenuComponent" />
    </div>
</template>

<style scoped lang="scss"></style>
