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
                        blocked_task: "Blocked task",
                        project: "Project",
                        not_specified: "Not specified",
                        due_date: "Due date",
                        creation_date: "Creation date",
                        this_task_blocks_the_following_tasks: "This task blocks the following tasks",
                        this_task_depends_on_the_following_tasks: "This task depends on the following tasks",
                        delayed_task: "Delayed task",
                        will_become_active: "Will become active",
                        annotations: "Annotations",
                    }
                },

                ru: {
                    message: {
                        blocking_tasks: "Блокирует задачи",
                        blocked_task: "Заблокированная задача",
                        project: "Проект",
                        not_specified: "Не указан",
                        due_date: "Срок выполнения",
                        creation_date: "Дата создания",
                        this_task_blocks_the_following_tasks: "Эта задача блокирует другие задачи",
                        this_task_depends_on_the_following_tasks: "Эта задача зависит от других задач",
                        delayed_task: "Отложенная задача",
                        will_become_active: "Станет активной",
                        annotations: "Аннотации",
                    }
                }
            }
        })
    ).mount("#tasks-app")
}