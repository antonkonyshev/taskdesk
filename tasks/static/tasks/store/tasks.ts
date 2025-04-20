import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchTasks } from 'tasks/services/tasks.service'
import { Task } from 'tasks/types/task'
import { useTaskStore } from 'tasks/store/task'

export const useTasksStore = defineStore('tasks', () => {
    const tasks = ref<Array<Task>>([])
    const taskStore = useTaskStore()

    async function removeTask(target: Task) {
        const idx = tasks.value.findIndex((elem) => elem.uuid == target.uuid)
        if (idx >= 0) {
            tasks.value.splice(idx, 1)
        }
        taskStore.excludeFromHistory(target)
        if (tasks.value.length) {
            taskStore.select(tasks.value[0])
        }
    }

    async function loadTasks() {
        (await fetchTasks()).forEach(async (target: Task) => {
            const idx = tasks.value.findIndex((elem) => elem.uuid == target.uuid)
            if (idx >= 0) {
                tasks.value[idx] = target
            } else {
                tasks.value.push(target)
            }
        })
        if (tasks.value.length && (!taskStore.task || !taskStore.task.value)) {
            taskStore.select(tasks.value[0])
        }
    }

    async function refreshTask(target) {
        let idx = tasks.value.findIndex((elem) => elem.uuid == target.uuid)
        if (idx < 0) {
            idx = tasks.value.findIndex((elem) => elem.uuid == 'new')
        }
        if (idx < 0) {
            tasks.value.unshift(target)
        } else {
            for (const field in target) {
                const key = field as keyof Task
                (tasks.value[idx][key] as any) = target[key]
            }
        }
    }

    function createTask() {
        const task = {
            id: 0, uuid: 'new', description: '', urgency: 100, project: '',
            tags: [], entry: null, depends: [], blocks: false,
            status: 'new', annotations: []
        } as Task
        tasks.value.unshift(task)
        taskStore.select(task)
    }

    function isTaskBlocking(target: Task): boolean {
        for (const it of tasks.value) {
            if (it.depends.indexOf(target.uuid) >= 0) {
                target.blocking = true
                return true
            }
        }
        target.blocking = false
        return false
    }

    function isTaskDepending(target: Task): boolean {
        for (const uuid of target.depends) {
            if (tasks.value.findIndex(elem => elem.uuid == uuid) >= 0) {
                target.depending = true
                return true
            }
        }
        target.depending = false
        return false
    }

    return {
        tasks, loadTasks, removeTask, createTask, refreshTask, isTaskBlocking,
        isTaskDepending,
    }
})