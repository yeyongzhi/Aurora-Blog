<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import Header from '@/layout/Header/index.vue'
import Content from '@/layout/Content/index.vue'

</script>

<template>
  <div class="w-full h-full overflow-hidden flex flex-col">
    <Header />
    <!-- <component :is="appStore.currentMenuComponent" /> -->
    <Content />
    <!-- 引入toaster组件，请保留这段代码 -->
    <Toaster position="top-center" closeButtonPosition="top-right" />
  </div>
</template>

<style scoped lang="scss"></style>
