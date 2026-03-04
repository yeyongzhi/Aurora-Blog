<script setup lang="ts" name="Header">
import APP_MENU from '@/router/index'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import useAppStore from '@/store/app'

const appStore = useAppStore()

</script>

<template>
    <div class="flex justify-center items-center gap-x-4">
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem v-for="item in APP_MENU" :key="item.key">
                    <NavigationMenuLink class="cursor-pointer" as-child v-if="!item.children" @click="appStore.handleMenuChange(item.key)">
                        <span :class="`w-fit whitespace-nowrap ${appStore.menuKey === item.key ? 'font-extrabold underline' : ''}`">{{ item.name }}</span>
                    </NavigationMenuLink>
                    <template v-else>
                        <NavigationMenuTrigger>{{ item.name }}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <NavigationMenuLink class="cursor-pointer" v-for="child in item.children" :key="child.key" @click="appStore.handleMenuChange(child.key)">
                                <span :class="`text-center w-fit whitespace-nowrap ${appStore.menuKey === child.key ? 'font-extrabold underline' : ''}`">{{ child.name }}</span>
                            </NavigationMenuLink>
                        </NavigationMenuContent>
                    </template>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    </div>
</template>

<style scoped lang="scss">

</style>
