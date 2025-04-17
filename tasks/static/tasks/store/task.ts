import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useRefHistory, useWebSocket } from '@vueuse/core'
import { Task } from '../types/task'

export const useTaskStore = defineStore('task', () => {
    const task = ref(null)

    const history = useRefHistory(task, {
        capacity: 64
    })

    let socket = null

    function select(target: Task) {
        if (task.value && target.uuid == task.value.uuid) {
            return
        }
        task.value = target
    }

    function update(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = target.value.trim()
        if (
            task.value && task.value.uuid && target.name in task.value &&
            task.value[target.name as keyof typeof task.value] != newValue &&
            (target.name != "description" || newValue)
        ) {
            const data = { uuid: task.value.uuid }
            data[target.name] = newValue
            socket.send(JSON.stringify(data))
            task.value[target.name as keyof typeof task.value] = newValue
        }
    }

    let editingTimeout: number = 0

    function editing(event: Event) {
        if (!socket && task.value && task.value.uuid) {
            // @ts-ignore
            socket = useWebSocket(window.API_BASE_URL + "/task/" + task.value.uuid + "/", {
                autoReconnect: { retries: 3, delay: 3000, onFailed() {
                    // TODO: Show a error notification
                }},
            })
        }

        if (editingTimeout) {
            clearTimeout(editingTimeout)
            editingTimeout = 0
        }
        editingTimeout = setTimeout(update, 3000, event)
    }

    function edited(event: Event) {
        if (editingTimeout) {
            clearTimeout(editingTimeout)
            editingTimeout = 0
        }
        update(event)
    }

    function markDone() {
        if (task.value && task.value.uuid) {
            socket.send(JSON.stringify({ uuid: task.value.uuid, done: true}))
            // TODO: remove on the client
        }
    }

    function remove() {
        if (task.value && task.value.uuid) {
            socket.send(JSON.stringify({ uuid: task.value.uuid, remove: true }))
            // TODO: remove on the client
        }
    }

    watch(task, (newTask, oldTask) => {
        if (newTask && oldTask && oldTask.uuid == newTask.uuid) {
            return
        }
        if (socket) {
            if (socket.status != "CLOSED") {
                socket.close()
            }
            socket = null
        }
    })

    return { task, history, select, update, editing, edited, markDone, remove }
})