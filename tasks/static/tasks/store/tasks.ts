import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchTasks } from 'tasks/services/tasks.service'
import { Task } from 'tasks/types/task'
import { useTaskStore } from 'tasks/store/task'

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

    function removeDependencies(target: Task): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                target.depends.forEach(it => it.blocks.delete(target))
                target.blocks.forEach(it => it.depends.delete(target))
                target.depends.clear()
                target.blocks.clear()
                resolve(true)
            } catch(err) {
                reject(err)
            }
        })
    }

    async function removeTask(target: Task) {
        await removeDependencies(target)
        const idx = tasks.value.findIndex((elem) => elem.uuid == target.uuid)
        tasks.value.splice(idx, 1)
        if (tasks.value.length) {
            taskStore.select(tasks.value[0])
        }
    }

    async function loadTasks() {
        (await fetchTasks()).forEach(async (target) => {
            const idx = tasks.value.findIndex((elem) => elem.uuid == target.uuid)
            target = addDependencies(target)
            if (idx >= 0) {
                await removeDependencies(tasks.value[idx]);
                tasks.value[idx] = target
            } else {
                tasks.value.push(target)
            }
        })
        if (tasks.value.length && (!taskStore.task || !taskStore.task.value)) {
            taskStore.select(tasks.value[0])
        }
    }

    return { tasks, loadTasks, removeTask }
})