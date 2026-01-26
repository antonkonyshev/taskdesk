import { createApp } from "vue"
import { createPinia } from "pinia"
import i18n from "./i18n"
import TasksApp from "tasks/TasksApp.vue"

if (document.getElementById("tasks-app")) {
    createApp(TasksApp).use(i18n).use(createPinia()).mount("#tasks-app")
}