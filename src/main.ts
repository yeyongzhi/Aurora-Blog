import { createApp } from 'vue'
import App from '@/App.vue'
import plugins from '@/plugins'
import useAppStore from '@/store/app'
import '@/style.css'
import '@/style/index.scss'
import 'vue-sonner/style.css'

const app = createApp(App)

app.use(plugins)

// 启动时从 URL 恢复路由状态
useAppStore().initializeUrlRouting()

app.mount('#app')
