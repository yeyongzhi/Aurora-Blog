import { readSettings } from '@/utils/settings'
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useColorMode } from '@vueuse/core'
import APP_MENU, { FLAT_ROUTES } from '@/router/index'
import { getRouteFromPath, getPathFromKey, setupUrlSync } from '@/router/urlSync'
import toast from '@/plugins/message'
import { hexToOklch } from '@/utils/color'

type ColorMode = 'light' | 'dark' | 'auto'

const localSettingInfoValue = readSettings()
const isRememberMenu = localSettingInfoValue.rememberMenu || false
const savedMenuKey = isRememberMenu ? localSettingInfoValue.rememberMenuKey : 'home'
const DEFAULT_MENU_KEY = APP_MENU.flatMap(item => item.children || [item]).some(item => item.key === savedMenuKey) ? savedMenuKey : 'home'
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
    const articlePath = ref<string>('')

    const handleMenuChange = (value: string) => {
        if (menuKey.value === value) return
        menuKey.value = value
        articlePath.value = ''
        window.history.pushState(
            { key: value, articlePath: '' },
            '',
            getPathFromKey(value),
        )
    }

    const handleArticleChange = (path: string) => {
        articlePath.value = path
        window.history.pushState(
            { key: menuKey.value, articlePath: path },
            '',
            getPathFromKey(menuKey.value, path || undefined),
        )
    }

    const handleBack = () => {
        window.history.back()
    }

    const handleForward = () => {
        window.history.forward()
    }
    const handleRefresh = () => {
        window.location.reload()
    }
    const gotoPage = (url: string) => {
        handleMenuChange(url.replace('/', ''))
    }

    const initFromUrl = () => {
        const route = getRouteFromPath(window.location.pathname)
        if (route) {
            menuKey.value = route.key
            articlePath.value = route.articlePath
        } else {
            // 根路径或未知路径 — 用 replaceState 设置默认页 URL
            window.history.replaceState(
                { key: DEFAULT_MENU_KEY, articlePath: '' },
                '',
                getPathFromKey(DEFAULT_MENU_KEY),
            )
        }
    }

    const initializeUrlRouting = () => {
        initFromUrl()
        setupUrlSync((key, artPath) => {
            menuKey.value = key
            articlePath.value = artPath
        })
    }

    const currentMenuComponent = computed(() => FLAT_ROUTES.get(menuKey.value)?.component ?? null)

    const savedTheme = localStorage.getItem('themeColor') || ''
    const themeColor = ref(/^#[0-9a-f]{6}$/i.test(savedTheme) ? savedTheme : DEFAULT_THEME_COLOR)
    
    const updateThemeColor = (color: string) => {
        if (!/^#[0-9a-f]{6}$/i.test(color)) return
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

    const initializeTheme = () => {
        const savedColor = localStorage.getItem('themeColor')
        if (savedColor && /^#[0-9a-f]{6}$/i.test(savedColor) && savedColor !== DEFAULT_THEME_COLOR) {
            updateThemeColor(savedColor)
        } else {
            updateThemeColor(DEFAULT_THEME_COLOR)
        }
    }
    initializeTheme()

    return {
        mode,
        themeOptions,
        handleModeChange,
        menuKey,
        articlePath,
        handleMenuChange,
        handleArticleChange,
        handleBack,
        handleForward,
        handleRefresh,
        currentMenuComponent,
        gotoPage,
        initializeUrlRouting,
        themeColor,
        updateThemeColor
    }
})

export default useAppStore
