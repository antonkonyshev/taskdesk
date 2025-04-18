import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useRefHistory, useWebSocket } from '@vueuse/core'
import { Task, Annotation } from '../types/task'
import { useTasksStore } from './tasks'

export const useTaskStore = defineStore('task', () => {
    const task = ref(null)
    const tasksStore = useTasksStore()

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

    function prepareSocket() {
        if (!socket && task.value && task.value.uuid) {
            // @ts-ignore
            socket = useWebSocket(window.API_BASE_URL + "/task/" + task.value.uuid + "/", {
                autoReconnect: { retries: 3, delay: 3000, onFailed() {
                    // TODO: Show a error notification
                }},
            })
        }
    }

    function closeSocket() {
        if (socket) {
            if (socket.status != "CLOSED") {
                socket.close()
            }
            socket = null
        }
    }

    function submit(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = target.value.trim()
        if (
            task.value && task.value.uuid && target.name in task.value &&
            task.value[target.name as keyof typeof task.value] != newValue &&
            (target.name != "description" || newValue)
        ) {
            prepareSocket()
            const data = { uuid: task.value.uuid }
            data[target.name] = newValue
            socket.send(JSON.stringify(data))
            task.value[target.name as keyof typeof task.value] = newValue
        }
    }

    let editingTimeout: number = 0

    function editing(event: Event) {
        if (editingTimeout) {
            clearTimeout(editingTimeout)
            editingTimeout = 0
        }
        if (event.target == document.activeElement) {
            editingTimeout = setTimeout(submit, 3000, event)
        } else {
            submit(event)
        }
    }

    async function update(method: string) {
        if (task.value && task.value.uuid) {
            const options = { method: method }
            if (method == "post") {
                options['body'] = JSON.stringify({
                    uuid: task.value.uuid, done: true
                })
                options['headers'] = { "Content-Type": "application/json" }
            }
            const rsp = await fetch(
                // @ts-ignore
                window.API_BASE_URL + "/task/" + task.value.uuid + "/",
                options
            )
            if (rsp.ok) {
                tasksStore.removeTask(task.value)
            }
        }
    }

    function annotate(event: Event) {
        const target = event.target as HTMLInputElement
        if (target.name == "annotate") {
            const annotation = target.value.trim()
            if (task.value && task.value.uuid && annotation) {
                prepareSocket()
                socket.send(JSON.stringify(
                    { uuid: task.value.uuid, annotate: annotation }))
                task.value.annotations.unshift(
                    { entry: new Date(), description: annotation } as Annotation
                )
            }
        }
    }

    function denotate(description: string) {
        if (description && task.value && task.value.uuid) {
            prepareSocket()
            socket.send(JSON.stringify(
                { uuid: task.value.uuid, denotate: description }))
            task.value.annotations = task.value.annotations.filter((elem: Annotation) => elem.description.indexOf(description) < 0)
        }
    }

    watch(task, (newTask, oldTask) => {
        if (newTask && oldTask && oldTask.uuid == newTask.uuid) {
            return
        }
        closeSocket()
    })

    return { task, history, select, editing, update, annotate, denotate }
})