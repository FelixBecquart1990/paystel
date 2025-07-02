import router from '../router'
import { createPinia } from 'pinia'
import vuetify from './vuetify'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

export function registerPlugins(app) {
  app.use(vuetify)
    .use(createPinia())
    .use(router)
    .use(Toast, {
      transition: "Vue-Toastification__slideBlurred",
      hideProgressBar: true,
      newestOnTop: true,
      position: "top-center",
    })
}
