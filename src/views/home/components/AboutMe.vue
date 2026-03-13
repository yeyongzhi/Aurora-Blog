<script setup lang="ts" name="AboutMe">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

interface Props {
    data: any;
}

const props = withDefaults(defineProps<Props>(), {
    data: () => {}
})

const aboutMeData = computed(() => {
    return props.data || {}
})

const defcription = computed(() => {
    let str = aboutMeData.value.description || ''
    str = str.split(/[\r\n]+/)
    return str
})

</script>

<template>
    <div class="flex flex-col gap-4 mb-8 mt-4">
        <div class="flex items-center gap-x-2">
            <span class="text-xl">📍</span>
            <div>{{ aboutMeData.province }} · {{ aboutMeData.city }}</div>
        </div>
        <div>
            <p v-for="item in defcription" :key="item">{{ item }}</p>
        </div>
        <div class="flex items-center gap-x-2">
            <Badge class="py-2 px-2" variant="secondary" v-for="tag in aboutMeData.userTag" :key="tag">
                {{ tag }}
            </Badge>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
