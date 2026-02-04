import { createRouter, createWebHistory } from "vue-router"
import TasksApp from "tasks/TasksApp.vue"

export const routes = [{
        path: '/tasks',
        name: 'list',
        component: TasksApp,
    }, {
        path: '/tasks/:uuid',
        name: 'edit',
        component: TasksApp,
        props: true,
}]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})