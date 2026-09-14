export const SYSTEM_SETTING_KEY = import.meta.env.VITE_APP_SYSTEM_SETTING_KEY || 'aurora-system-settings'
export function readSettings(): { rememberMenu: boolean; rememberMenuKey: string } {
    try {
        const value = JSON.parse(localStorage.getItem(SYSTEM_SETTING_KEY) || '{}')
        return { rememberMenu: value?.rememberMenu === true, rememberMenuKey: typeof value?.rememberMenuKey === 'string' ? value.rememberMenuKey : 'home' }
    } catch { return { rememberMenu: false, rememberMenuKey: 'home' } }
}
