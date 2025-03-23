import { createApp } from "vue"
import TasksApp from "tasks/TasksApp.vue"

if (document.getElementById("tasks-app")) {
    createApp(TasksApp).mount("#tasks-app")
}