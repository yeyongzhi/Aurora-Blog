import { defineStore } from 'pinia'
import { onMounted, ref, computed, watch } from 'vue'
import { useColorMode } from '@vueuse/core'
import APP_MENU from '@/router/index'
import toast from '@/plugins/message'
import { hexToOklch } from '@/utils/color'

type ColorMode = 'light' | 'dark' | 'auto'

const DEFAULT_MODE: ColorMode = 'light'
const localSettingInfo = localStorage.getItem(import.meta.env.VITE_APP_SYSTEM_SETTING_KEY)
const localSettingInfoValue = (localSettingInfo && localSettingInfo !== '') ? JSON.parse(localSettingInfo) : {}
const isRememberMenu = localSettingInfoValue.rememberMenu || false
const DEFAULT_MENU_KEY = isRememberMenu ? localSettingInfoValue.rememberMenuKey || 'home' : 'home'
export const DEFAULT_THEME_COLOR = '#000000'

const useAppStore = defineStore('app', () => {
    const mode = useColorMode()
    const themeOptions = ref([
        {
            label: '亮色模式',
            value: 'light',
        },
        {
            label: '暗色模式',
            value: 'dark',
        },
        {
            label: '系统模式',
            value: 'auto',
        }
    ])
    const handleModeChange = (value: ColorMode) => {
        toast.success(`已切换到${value === 'auto' ? '系统' : value}模式`)
        mode.value = value
    }

    const menuKey = ref(DEFAULT_MENU_KEY)
    const historyMenuList = ref<string[]>([DEFAULT_MENU_KEY])
    const historyMenuIndex = ref(0)
    const handleMenuChange = (value: string) => {
        menuKey.value = value
        historyMenuList.value.push(value)
        historyMenuIndex.value = historyMenuIndex.value + 1
    }
    const handleBack = () => {
        if(historyMenuList.value.length === 1) {
            return toast.warning('没有上一级了')
        }
        historyMenuIndex.value = historyMenuIndex.value - 1
        menuKey.value = historyMenuList.value[historyMenuIndex.value] || DEFAULT_MENU_KEY
    }
    const handleForward = () => {
        if(historyMenuList.value.length === 1) {
            return toast.warning('没有下一级了')
        }
        historyMenuIndex.value = historyMenuIndex.value + 1
        menuKey.value = historyMenuList.value[historyMenuIndex.value] || DEFAULT_MENU_KEY
    }
    const handleRefresh = () => {
        window.location.reload()
    }
    const gotoPage = (url: string) => {
        handleMenuChange(url.replace('/', ''))
    }
    const currentMenuComponent = computed(() => {
        let targetMenu: any = null
        APP_MENU.forEach((item) => {
            if (item.key === menuKey.value) {
                targetMenu = item
            } else if (item.children) {
                item.children.forEach((child) => {
                    if (child.key === menuKey.value) {
                        targetMenu = child
                    }
                })
            }
        })
        return targetMenu?.component || null
    })

    const themeColor = ref(localStorage.getItem('themeColor') || DEFAULT_THEME_COLOR)
    
    const updateThemeColor = (color: string) => {
        themeColor.value = color
        localStorage.setItem('themeColor', color)
        const oklchColor = hexToOklch(color)
        document.documentElement.style.setProperty('--primary', oklchColor)
        document.documentElement.style.setProperty('--ring', oklchColor)
    }

    watch(themeColor, (newColor) => {
        const oklchColor = hexToOklch(newColor)
        document.documentElement.style.setProperty('--primary', oklchColor)
        document.documentElement.style.setProperty('--ring', oklchColor)
    })

    onMounted(() => {
        mode.value = DEFAULT_MODE
        const savedColor = localStorage.getItem('themeColor')
        if (savedColor && savedColor !== DEFAULT_THEME_COLOR) {
            updateThemeColor(savedColor)
        } else {
            updateThemeColor(DEFAULT_THEME_COLOR)
        }
    })

    return {
        mode,
        themeOptions,
        handleModeChange,
        menuKey,
        handleMenuChange,
        handleBack,
        handleForward,
        handleRefresh,
        currentMenuComponent,
        gotoPage,
        themeColor,
        updateThemeColor
    }
})

export default useAppStore
