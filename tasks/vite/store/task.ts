import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRefHistory } from '@vueuse/core'
import { Task, Annotation } from 'tasks/types/task'
import { useTasksStore } from './tasks'
import {
    closeTaskSocket, markTask, updateTask, annotateTask, denotateTask
} from 'tasks/services/tasks.service'

export const useTaskStore = defineStore('task', () => {
    const task = ref(null)
    const notification = ref("")
    const tasksStore = useTasksStore()

    const history = useRefHistory(task, {
        capacity: 64
    })

    function select(target: Task | null) {
        task.value = target
    }

    const depends = computed(() => {
        const relations = new Set([])
        for (const uuid of task.value.depends) {
            const relation = tasksStore.tasks.find(elem => elem.uuid == uuid)
            if (relation) {
                relations.add(relation)
            }
        }
        return relations
    })

    const blocks = computed(() => {
        const relations = new Set([])
        if (task.value && task.value.blocks !== false) {
            for (const target of tasksStore.tasks) {
                if (
                    target.depends && target.depends.length &&
                    target.depends.indexOf(task.value.uuid) >= 0
                ) {
                    relations.add(target)
                }
            }
        }
        return relations
    })

    async function submit(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = target.value.trim()
        if (
            task.value && task.value.uuid && target.name in task.value &&
            task.value[target.name as keyof typeof task.value] != newValue &&
            (target.name != "description" || newValue)
        ) {
            const data = { uuid: task.value.uuid }
            data[target.name] = newValue
            await updateTask(data)
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

    async function update(method: 'post'|'delete') {
        if (task.value && task.value.uuid) {
            await markTask(task.value.uuid, method)
            await tasksStore.removeTask(task.value)
            select(null)
        }
    }

    async function annotate(event: Event) {
        const target = event.target as HTMLInputElement
        if (target.name == "annotate") {
            const annotation = target.value.trim()
            if (task.value && task.value.uuid && annotation) {
                await annotateTask(
                    { uuid: task.value.uuid, annotate: annotation })
                task.value.annotations.unshift(
                    { entry: new Date(), description: annotation } as Annotation
                )
            }
        }
    }

    async function denotate(description: string) {
        if (description && task.value && task.value.uuid) {
            await denotateTask({ uuid: task.value.uuid, denotate: description })
            task.value.annotations = task.value.annotations.filter(
                (elem: Annotation) => elem.description.indexOf(description) < 0)
        }
    }

    function excludeFromHistory(target: Task) {
        for (const stack of ['history', 'undoStack', 'redoStack']) {
            let idx = history[stack].value.findIndex(
                (elem) => (elem.snapshot && elem.snapshot.uuid == target.uuid))
            if (target.id == 2 && idx >= 0)
            if (idx >= 0) {
                history[stack].value.splice(idx, 1)
            }
        }
    }

    watch(task, async (newTask, oldTask) => {
        if (oldTask && oldTask.uuid == 'new') {
            tasksStore.removeTask(oldTask)
        }
        if (!newTask || !oldTask || oldTask.uuid != newTask.uuid) {
            await closeTaskSocket()
        }
    })

    watch(() => task.value && task.value.uuid, (newUuid, oldUuid) => {
        if (oldUuid != 'new' || !newUuid) {
            return
        }
        if (newUuid && newUuid != 'new') {
            notification.value = 'message.task_created'
            setTimeout(() => notification.value = '', 2000)
        }
    })

    return {
        task, history, depends, blocks, select, editing, update,
        annotate, denotate, excludeFromHistory, notification,
    }
})