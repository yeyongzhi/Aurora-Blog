import { defineStore } from 'pinia'
import { ref } from 'vue'

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
        fetch('/user.json')
        .then(response => response.json())
        .then(data => {
            userInfo.value = data
            userLoading.value = false
        })
    }

    return {
        userInfo,
        userLoading,
        getUserData
    }
})

export default useUserStore