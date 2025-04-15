import { createApp } from "vue"
import { createI18n } from "vue-i18n"
import TasksApp from "tasks/TasksApp.vue"

if (document.getElementById("tasks-app")) {
    createApp(TasksApp).use(
        createI18n({
            legacy: false,
            messages: {
                en: {
                    message: {
                        blocking_tasks: "Blocking tasks"
                    }
                },

                ru: {
                    message: {
                        blocking_tasks: "Блокирует задачи"
                    }
                }
            }
        })
    ).mount("#tasks-app")
}