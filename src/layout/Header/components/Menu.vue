<script setup lang="ts" name="Header">
import APP_MENU from '@/router/index'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from '@/components/ui/navigation-menu'
import useAppStore from '@/store/app'

const appStore = useAppStore()

</script>

<template>
    <div class="flex justify-center items-center gap-x-4">
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem v-for="item in APP_MENU" :key="item.key">
                    <NavigationMenuLink as-child v-if="!item.children">
                        <a>{{ item.name }}</a>
                    </NavigationMenuLink>
                    <template v-else>
                        <NavigationMenuTrigger>{{ item.name }}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <NavigationMenuLink v-for="child in item.children" :key="child.key">
                                <a>{{ child.name }}</a>
                            </NavigationMenuLink>
                        </NavigationMenuContent>
                    </template>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    </div>
</template>

<style scoped lang="scss"></style>
