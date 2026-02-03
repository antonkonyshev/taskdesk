import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useWindowSize } from '@vueuse/core'
import { fetchItems } from 'TaskDesk/js/common/service'
import { refreshItem } from 'TaskDesk/js/common/store'
import { Task } from 'tasks/types/task'
import { useTaskStore } from './task'

export const useTasksStore = defineStore('tasks', () => {
    const tasks = ref<Array<Task>>([])
    const taskStore = useTaskStore()
    const { width } = useWindowSize()

    const endpoint = () => "/task/"
    const displayTask = (task: Task) => refreshItem(task, tasks, (elem: Task) => (task.uuid == elem.uuid), true)
    const loadTasks = async () => (await fetchItems(endpoint())).forEach(displayTask)

    function createTask() {
        const task = {
            id: 0, uuid: 'new', description: '', urgency: 100, project: '',
            tags: [], entry: null, depends: [], blocks: false,
            status: 'new', annotations: []
        } as Task
        tasks.value.unshift(task)
        taskStore.select(task)
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

    function removeTaskRelations(target: Task) {
        for (const related of tasks.value) {
            if (related.depending && related.depends.length) {
                const idx = related.depends.indexOf(target.uuid)
                if (idx >= 0) {
                    related.depending = null
                    related.depends.splice(idx, 1)
                }
            }
        }
        for (const uuid of target.depends) {
            const related = tasks.value.find(elem => elem.uuid == uuid)
            if (related) {
                related.blocking = null
            }
        }
    }

    async function removeTask(target: Task) {
        const idx = tasks.value.findIndex((elem) => elem.uuid == target.uuid)
        if (idx >= 0) {
            tasks.value.splice(idx, 1)
        }
        taskStore.excludeFromHistory(target)
        if (tasks.value.length && width.value >= 800) {
            taskStore.select(tasks.value[0])
        }
        removeTaskRelations(target)
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