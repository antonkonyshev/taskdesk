import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRefHistory } from '@vueuse/core'
import { Task } from '../types/task'


export const useTaskStore = defineStore('task', () => {
    const tasks = ref<Array<Task>>([])
    const task = ref(null)

    function select(target: Task) {
        task.value = target
    }

    const history = useRefHistory(task, {
        capacity: 64
    })

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

    async function fetchTasks(): Promise<void> {
        // @ts-ignore
        const rsp = await fetch(window.API_BASE_URL + "/task")
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
            if (tasks.value.length && !task.value) {
                select(tasks.value[0])
            }
        }
    }

    return { task, tasks, history, select, fetchTasks }
})