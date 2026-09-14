import type { App } from 'vue'
import { createPinia } from "pinia";

export default function install(app: App) {
  const pinia = createPinia();
  // 注册pinia
  app.use(pinia);
}
