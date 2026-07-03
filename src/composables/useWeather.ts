import { computed, ref } from 'vue'

interface WeatherArea {
    areaName?: Array<{
        value: string
    }>
    country?: Array<{
        value: string
    }>
}

interface WeatherCondition {
    FeelsLikeC?: string
    humidity?: string
    temp_C?: string
    weatherDesc?: Array<{
        value: string
    }>
    winddir16Point?: string
    windspeedKmph?: string
}

interface WeatherAstronomy {
    sunrise?: string
    sunset?: string
}

export interface WeatherDay {
    date: string
    avgtempC: string
    maxtempC: string
    mintempC: string
    astronomy?: WeatherAstronomy[]
}

export interface WeatherData {
    current_condition?: WeatherCondition[]
    nearest_area?: WeatherArea[]
    weather?: WeatherDay[]
}

const DEFAULT_CITY = '杭州'
const DEFAULT_LANGUAGE = 'zh'

export function useWeather(defaultCity = DEFAULT_CITY, defaultLanguage = DEFAULT_LANGUAGE) {
    const weatherData = ref<WeatherData | null>(null)
    const weatherLoading = ref(false)
    const weatherError = ref('')
    const city = ref(defaultCity)
    const language = ref(defaultLanguage)

    const weatherUrl = computed(() => {
        const params = new URLSearchParams({
            format: 'j1',
            lang: language.value,
        })

        return `https://wttr.in/${encodeURIComponent(city.value)}?${params.toString()}`
    })
    const currentWeather = computed(() => weatherData.value?.current_condition?.[0] || null)
    const nearestArea = computed(() => weatherData.value?.nearest_area?.[0] || null)
    const weatherDays = computed(() => weatherData.value?.weather || [])

    const fetchWeather = async (targetCity = city.value, targetLanguage = language.value) => {
        city.value = targetCity
        language.value = targetLanguage
        weatherLoading.value = true
        weatherError.value = ''

        try {
            const response = await fetch(weatherUrl.value)

            if (!response.ok) {
                throw new Error(`天气请求失败：${response.status}`)
            }

            weatherData.value = await response.json()
        } catch (error) {
            weatherData.value = null
            weatherError.value = error instanceof Error ? error.message : '天气数据获取失败'
        } finally {
            weatherLoading.value = false
        }
    }

    return {
        city,
        language,
        weatherData,
        weatherLoading,
        weatherError,
        weatherUrl,
        currentWeather,
        nearestArea,
        weatherDays,
        fetchWeather,
    }
}
