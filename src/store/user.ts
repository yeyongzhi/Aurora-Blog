import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFetchData } from '@/utils/index'

export interface UserInfo {
    name: string;
    signature: string;
    province: string;
    city: string;
    userTag?: string;
    description?: string;
    [key: string]: any;
}

const useUserStore = defineStore('user', () => {
    const userLoading = ref(false)
    const userError = ref('')
    const userInfo = ref<UserInfo>({
        name: '',
        signature: '',
        province: '',
        city: '',
    })

    const getUserData = async () => {
        userLoading.value = true
        userError.value = ''
        try {
            const data = await getFetchData('/user.json')
            if (!data || typeof data.name !== 'string') throw new Error('用户资料格式无效')
            userInfo.value = data
        } catch { userError.value = '个人资料加载失败，其他内容仍可使用' }
        finally { userLoading.value = false }
    }

    return {
        userInfo,
        userLoading,
        userError,
        getUserData
    }
})

export default useUserStore