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
                        blocking_tasks: "Blocking tasks",
                        project: "Project",
                        not_specified: "Not specified",
                        due_date: "Due date",
                        creation_date: "Creation date",
                    }
                },

                ru: {
                    message: {
                        blocking_tasks: "Блокирует задачи",
                        project: "Проект",
                        not_specified: "Не указан",
                        due_date: "Срок выполнения",
                        creation_date: "Дата создания",
                    }
                }
            }
        })
    ).mount("#tasks-app")
}