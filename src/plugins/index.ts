import { createPinia } from "pinia";

export default function install(app: any) {
  const pinia = createPinia();
  // 注册pinia
  app.use(pinia);
}
