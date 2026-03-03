import { defineStore } from 'pinia'
import { onMounted, ref, computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import APP_MENU from '@/router/index'
import toast from '@/plugins/message'

type ColorMode = 'light' | 'dark' | 'auto'

const DEFAULT_MODE: ColorMode = 'light'
const DEFAULT_MENU_KEY = 'note'

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
    const handleMenuChange = (value: string) => {
        menuKey.value = value
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

    onMounted(() => {
        mode.value = DEFAULT_MODE
    })

    return {
        mode,
        themeOptions,
        handleModeChange,
        menuKey,
        handleMenuChange,
        currentMenuComponent,
        gotoPage
    }
})

export default useAppStore
