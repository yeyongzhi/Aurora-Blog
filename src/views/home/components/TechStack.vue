<script setup lang="ts" name="Home">
import { onMounted, ref, computed } from 'vue';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'

const uesrData = ref<any>(null)

const techStackData = computed(() => {
  return uesrData.value?.techStack || []
})

onMounted(() => {
  fetch('/user.json')
    .then(response => response.json())
    .then(data => {
      uesrData.value = data
      console.log(uesrData.value)
    })
})

</script>

<template>
    <div>
        
    </div>
</template>

<style scoped lang="scss"></style>
