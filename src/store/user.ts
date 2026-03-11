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
    const userInfo = ref<UserInfo>({
        name: '',
        signature: '',
        province: '',
        city: '',
    })

    const getUserData = async () => {
        userLoading.value = true
        const data = await getFetchData('/user.json')
        userInfo.value = data
        userLoading.value = false
    }

    return {
        userInfo,
        userLoading,
        getUserData
    }
})

export default useUserStore