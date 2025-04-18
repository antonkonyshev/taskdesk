import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Task } from '../types/task'
import { useTaskStore } from './task'

export const useTasksStore = defineStore('tasks', () => {
    const tasks = ref<Array<Task>>([])
    const taskStore = useTaskStore()

    function addDependencies(target): Task {
        if (typeof target.depends === "undefined") {
            target.depends = new Set<Task>()
        }
        if (typeof target.blocks === "undefined") {
            target.blocks = new Set<Task>()
        }
        const dependencies = new Set<Task>()
        for (let idx = 0; idx < target.depends.length; idx++) {
            const dep = tasks.value.find(elem => elem.uuid == target.depends[idx])
            if (dep) {
                dep.blocks.add(target)
                dependencies.add(dep)
            }
        }
        target.depends = dependencies
        return target as Task
    }

    function removeDependencies(target: Task) {
        target.depends.forEach(it => it.blocks.delete(target))
        target.blocks.forEach(it => it.depends.delete(target))
        target.depends.clear()
        target.blocks.clear()
    }

    function removeTask(target: Task) {
        removeDependencies(target)
        const idx = tasks.value.findIndex((elem) => elem.uuid == target.uuid)
        tasks.value.splice(idx, 1)
        if (tasks.value.length) {
            taskStore.select(tasks.value[0])
        }
    }

    async function fetchTasks(): Promise<void> {
        // @ts-ignore
        const rsp = await fetch(window.API_BASE_URL + "/task/")
        if (rsp.ok) {
            (await rsp.json()).forEach((target) => {
                const idx = tasks.value.findIndex((elem) => elem.uuid == target.uuid)
                target = addDependencies(target)
                if (idx >= 0) {
                    removeDependencies(tasks.value[idx]);
                    tasks.value[idx] = target
                } else {
                    tasks.value.push(target)
                }
                if (target.depends && target.depends.length) {
                }
            });
            if (tasks.value.length && (!taskStore.task || !taskStore.task.value)) {
                taskStore.select(tasks.value[0])
            }
        }
    }

    return { tasks, fetchTasks, removeTask }
})