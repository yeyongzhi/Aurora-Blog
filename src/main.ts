import { createApp } from 'vue'
import App from '@/App.vue'
import plugins from '@/plugins'
import '@/style.css'
import '@/style/index.scss'
import 'vue-sonner/style.css'

const app = createApp(App)

app.use(plugins)
app.mount('#app')
