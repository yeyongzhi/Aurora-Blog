<script setup lang="ts" name="WelcomeHero">
import { BookOpenIcon, CompassIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card'

defineProps<{
    title: string
    subtitle: string
}>()

defineEmits<{
    explore: []
    viewNotes: []
}>()
</script>

<template>
    <Card class="py-4">
        <CardHeader>
            <CardTitle></CardTitle>
            <CardDescription>
                <Badge variant="secondary" class="w-fit">Aurora Blog</Badge>
            </CardDescription>
        </CardHeader>
        <CardContent class="gap-y-8">
            <div class="flex items-start justify-between gap-6 max-md:flex-col max-md:items-start">
                <div>
                    <p class="text-5xl font-extrabold mb-4">{{ title }}</p>
                    <p class="leading-8 text-muted-foreground">{{ subtitle }}</p>
                </div>
                <!-- <img
                    :src="AvatarImg"
                    alt="Aurora Blog"
                    class="rounded-xl w-[200px] h-[200px] shrink-0 object-cover border"
                > -->
            </div>
        </CardContent>
        <CardFooter>
            <div class="flex flex-wrap gap-x-4">
                <Button @click="$emit('explore')">
                    <CompassIcon class="size-4" />
                    开始浏览
                </Button>
                <Button variant="outline" @click="$emit('viewNotes')">
                    <BookOpenIcon class="size-4" />
                    查看笔记
                </Button>
            </div>
        </CardFooter>
    </Card>
</template>
