<script setup lang="ts" name="Home">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TechStackItem {
  icon: string;
  name: string;
  description?: string;
  data: string[]
}

interface Props {
  data: TechStackItem[]
}

const props = withDefaults(defineProps<Props>(), {
  data: () => []
})

</script>

<template>
  <div class="grid grid-cols-3 gap-4 mb-8 mt-4">
    <Card
      v-for="item in props.data"
      :key="item.name"
      class="border-2 gap-4 py-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-2 hover:border-primary cursor-pointer"
    >
      <CardHeader>
        <CardTitle class="flex text-lg items-center">
          <span class="mr-2 text-2xl">{{ item.icon }}</span>
          {{ item.name }}
        </CardTitle>
        <CardDescription>{{ item.description }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Badge variant="secondary" v-for="tech in item.data" :key="tech">
            <span class="text-sm">{{ tech }}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped lang="scss"></style>
