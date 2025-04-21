import { createI18n } from "vue-i18n"

export default createI18n({
    legacy: false,
    messages: {
        en: {
            message: {
                blocking_tasks: "Blocking tasks",
                blocking: "Blocking",
                blocked_task: "Blocked task",
                blocked: "Blocked",
                project: "Project",
                not_specified: "Not specified",
                due_date: "Due date",
                creation_date: "Creation date",
                created: "Created",
                this_task_blocks_the_following_tasks: "This task blocks the following tasks",
                this_task_depends_on_the_following_tasks: "This task depends on the following tasks",
                delayed_task: "Delayed task",
                delayed: "Delayed",
                will_become_active: "Will become active",
                annotations: "Annotations",
                add_annotation: "Add annotation",
                enter_annotation_description: "Enter annotation description...",
                enter_task_description: "Enter task description...",
            }
        },

        ru: {
            message: {
                blocking_tasks: "Блокирует задачи",
                blocking: "Блокирует",
                blocked_task: "Заблокированная задача",
                blocked: "Заблокированная",
                project: "Проект",
                not_specified: "Не указан",
                due_date: "Срок выполнения",
                creation_date: "Дата создания",
                created: "Создана",
                this_task_blocks_the_following_tasks: "Эта задача блокирует другие задачи",
                this_task_depends_on_the_following_tasks: "Эта задача зависит от других задач",
                delayed_task: "Отложенная задача",
                delayed: "Отложенная",
                will_become_active: "Станет активной",
                annotations: "Аннотации",
                add_annotation: "Добавить аннтонацию",
                enter_annotation_description: "Введите аннотацию...",
                enter_task_description: "Введите описание задачи...",
            }
        }
    }
})