<script setup lang="ts" name="SystemSetting">
import { ref, onMounted, watch } from 'vue'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item'
import { Button } from "@/components/ui/button"
import { Settings } from 'lucide-vue-next'
import Tooltip from '@/components/self/Tooltip/index.vue'
import Icon from '@/components/self/Icon/index.vue'
import themeColorData from '@/style/themeColor.json'
import useAppStore, { DEFAULT_THEME_COLOR } from '@/store/app'
import { Label } from '@/components/ui/label'

const appStore = useAppStore()
const dialogOpen = ref(false)
const currentThemeColor = ref(appStore.themeColor)

const tabs = ref([
    { value: 'common', label: '通用设置' },
    { value: 'theme', label: '主题设置' },
])

const tabKey = ref('common')

const DEFAULT_SETTING_INFO = {
    rememberMenu: true,
    rememberMenuKey: 'home'
}

const settingInfo = ref<{
    rememberMenu: boolean,
    rememberMenuKey: string,
}>({
    rememberMenu: true,
    rememberMenuKey: '',
})

const asyncSettingInfo = () => {
    localStorage.setItem(import.meta.env.VITE_APP_SYSTEM_SETTING_KEY, JSON.stringify(settingInfo.value))
}

const getSettingInfo = () => {
    const settingInfoStr = localStorage.getItem(import.meta.env.VITE_APP_SYSTEM_SETTING_KEY)
    return (settingInfoStr && settingInfoStr !== '') ? JSON.parse(settingInfoStr) : null
}

const handleThemeColorChange = (color: string) => {
    appStore.updateThemeColor(color)
}

watch(() => appStore.themeColor, (newColor) => {
    currentThemeColor.value = newColor
})

onMounted(() => {
    const localSetting = getSettingInfo()
    if (!localSetting) {
        settingInfo.value = DEFAULT_SETTING_INFO
        asyncSettingInfo()
    } else {
        settingInfo.value = localSetting
    }
    watch(() => appStore.menuKey, (newVal) => {
        settingInfo.value.rememberMenuKey = newVal
    })
})

watch(() => settingInfo, () => {
    asyncSettingInfo()
}, { deep: true })

</script>

<template>
    <div>
        <Tooltip content="系统设置">
            <Button size="icon" variant="outline" @click="dialogOpen = true">
                <Settings />
            </Button>
        </Tooltip>
        <Dialog v-model:open="dialogOpen">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>系统设置</DialogTitle>
                </DialogHeader>
                <Tabs v-model="tabKey">
                    <TabsList>
                        <TabsTrigger v-for="item in tabs" :key="item.value" :value="item.value">{{ item.label }}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <div v-show="tabKey === 'common'">
                    <Item variant="outline" size="sm" as-child>
                        <a href="#">
                            <ItemMedia>
                                <Icon name="Logs" />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>记住菜单</ItemTitle>
                                <ItemDescription>
                                    刷新/关闭页面的时候记住当前菜单
                                </ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Switch v-model="settingInfo.rememberMenu" />
                            </ItemActions>
                        </a>
                    </Item>
                </div>
                <div v-show="tabKey === 'theme'">
                    <div class="mb-4 flex items-center justify-between">
                        <Label>
                        <Icon name="Palette" />
                        主题颜色
                    </Label>
                    <Button class="flex items-center justify-between gap-x-2" size="sm" variant="outline"
                        @click="handleThemeColorChange(DEFAULT_THEME_COLOR)" :class="{
                            'ring-2 ring-offset-2': currentThemeColor === DEFAULT_THEME_COLOR,
                            'ring-primary': currentThemeColor === DEFAULT_THEME_COLOR
                        }">
                        <div class="w-2 h-2 rounded-full transition-all duration-300" :style="{
                            backgroundColor: DEFAULT_THEME_COLOR,
                        }">
                        </div>
                        恢复默认
                    </Button>
                    </div>
                    <div class="w-full">
                        <div class="grid grid-cols-3 gap-2">
                            <Button class="flex items-center justify-between gap-x-2" size="sm" variant="outline"
                                v-for="item in themeColorData" :key="item.color"
                                @click="handleThemeColorChange(item.color)" :class="{
                                    'ring-2 ring-offset-2': item.color === currentThemeColor,
                                    'ring-primary': item.color === currentThemeColor
                                }">
                                <div class="w-2 h-2 rounded-full transition-all duration-300" :style="{
                                    backgroundColor: item.color,
                                }">
                                </div>
                                {{ item.name }}
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="dialogOpen = false">
                        取消
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<style scoped lang="scss"></style>
