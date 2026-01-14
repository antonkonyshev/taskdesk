import { createApp } from "vue"
import { createPinia } from "pinia"
import i18n from "./i18n"
import NewsApp from "news/NewsApp.vue"
import { router } from "news/navigation/routing"

if (document.getElementById("news-app")) {
    createApp(NewsApp).use(i18n).use(createPinia()).use(router).mount("#news-app")
}