<script setup lang="ts">
import type { ScrollAreaRootProps } from "reka-ui"
import { type HTMLAttributes, shallowRef, computed } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  ScrollAreaViewport,
} from "reka-ui"
import { cn } from "@/lib/utils"
import ScrollBar from "./ScrollBar.vue"

const props = defineProps<ScrollAreaRootProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const scrollAreaRootRef = shallowRef<any>(null)

const viewport = computed(() => {
  if(!scrollAreaRootRef.value) {
    return null
  }
  return scrollAreaRootRef.value.$el.querySelector('[data-slot="scroll-area-viewport"]')
})

const screenTop = computed(() => {
  if(!viewport.value) {
    return 0
  }
  return viewport.value.scrollTop
})
  
defineExpose({
  scrollTop: screenTop.value,
  scrollTo: (options: any) => {
    if(!viewport.value) {
      return
    }
    viewport.value.scrollTo(options)
  },
})


</script>

<template>
  <ScrollAreaRoot data-slot="scroll-area" v-bind="delegatedProps" :class="cn('relative', props.class)"
    ref="scrollAreaRootRef">
    <ScrollAreaViewport data-slot="scroll-area-viewport"
      class="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1">
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
