import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useTaskStore } from 'tasks/store/task'
import { Task } from 'tasks/types/task'
import { 
    prepareTaskSocket, closeTaskSocket, annotateTask, denotateTask, updateTask,
    markTask
} from 'tasks/services/tasks.service'
import i18n from 'TaskDesk/js/i18n'
import { useTasksStore } from 'tasks/store/tasks'
import { fetchItems } from 'TaskDesk/js/common/service'

describe('task store', () => {
    let task = null
    let atask = null
    let aatask = null
    let store = null
    let lastRequest = null
    const socket = { send: (data) => lastRequest = data }

    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        vi.mock('tasks/services/tasks.service.ts')
        vi.mock('TaskDesk/js/common/service.ts')
        vi.mocked(prepareTaskSocket).mockResolvedValue(socket)
        vi.mocked(closeTaskSocket).mockResolvedValue()
        setActivePinia(createPinia())
        config.global.plugins = [i18n]
        task = {
            id: 1,
            description: "First testing task",
            uuid: "abc-def-1",
            urgency: 3.0,
            project: "test",
            depends: [],
            annotations: [],
        } as Task
        atask = {
            id: 2,
            description: "Second testing task",
            uuid: "abc-def-2",
            urgency: 2.0,
            project: "test",
            depends: [],
            annotations: [],
        } as Task
        aatask = {
            id: 0,
            description: "Third testing task",
            uuid: "abc-def-3",
            urgency: 1.0,
            project: "test",
            depends: [],
            annotations: [],
        } as Task
        vi.mocked(fetchItems).mockResolvedValue([task, atask, aatask])
        const tasksStore = useTasksStore()
        tasksStore.tasks = [task, atask, aatask]
        store = useTaskStore()
        store.select(task)
    })

    afterEach(() => {
        vi.resetAllMocks()
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
    })

    test('task selection', () => {
        expect(store.task.id).toBe(1)
        expect(store.task.description).toBe("First testing task")
        expect(store.task.uuid).toBe("abc-def-1")
    })


    test('tasks navigation history', async () => {
        store.history.commit()
        expect(store.task.id).toBe(1)
        expect(store.task.description).toBe("First testing task")
        expect(store.task.uuid).toBe("abc-def-1")

        store.select(atask)
        store.history.commit()
        expect(store.task.id).toBe(2)
        expect(store.task.description).toBe("Second testing task")
        expect(store.task.uuid).toBe("abc-def-2")

        store.select(aatask)
        store.history.commit()
        expect(store.task.id).toBe(0)
        expect(store.task.description).toBe("Third testing task")
        expect(store.task.uuid).toBe("abc-def-3")

        store.history.undo()
        expect(store.task.id).toBe(2)
        expect(store.task.description).toBe("Second testing task")
        expect(store.task.uuid).toBe("abc-def-2")

        store.history.undo()
        expect(store.task.id).toBe(1)
        expect(store.task.description).toBe("First testing task")
        expect(store.task.uuid).toBe("abc-def-1")

        store.history.redo()
        expect(store.task.id).toBe(2)
        expect(store.task.description).toBe("Second testing task")
        expect(store.task.uuid).toBe("abc-def-2")

        store.history.redo()
        expect(store.task.id).toBe(0)
        expect(store.task.description).toBe("Third testing task")
        expect(store.task.uuid).toBe("abc-def-3")

        store.excludeFromHistory(atask)
        store.history.undo()
        expect(store.task.id).toBe(1)
        expect(store.task.description).toBe("First testing task")
        expect(store.task.uuid).toBe("abc-def-1")
    })

    test('task annotations', async () => {
        await store.annotate(vi.mocked({ target: {name: 'annotate', value: 'Testing annotation', addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => { return true }} as EventTarget} as Event))
        expect(annotateTask).toHaveBeenCalledOnce()
        expect(store.task.annotations.length).toBe(1)
        expect(store.task.annotations[0].description).toBe("Testing annotation")

        await store.annotate(vi.mocked({ target: {name: 'annotate', value: 'Another annotation', addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => { return true }} as EventTarget} as Event))
        expect(annotateTask).toHaveBeenCalledTimes(2)
        expect(store.task.annotations.length).toBe(2)
        expect(store.task.annotations[0].description).toBe("Another annotation")
        expect(store.task.annotations[1].description).toBe("Testing annotation")
    })

    test('task denotations', async () => {
        await store.annotate(vi.mocked({ target: {name: 'annotate', value: 'Testing annotation', addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => { return true }} as EventTarget} as Event))
        await store.annotate(vi.mocked({ target: {name: 'annotate', value: 'Another annotation', addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => { return true }} as EventTarget} as Event))
        expect(store.task.annotations.length).toBe(2)

        await store.denotate("Opaopa")
        expect(denotateTask).toHaveBeenCalledOnce()
        expect(store.task.annotations.length).toBe(2)

        await store.denotate("Testing annotation")
        expect(denotateTask).toHaveBeenCalledTimes(2)
        expect(store.task.annotations.length).toBe(1)
        expect(store.task.annotations[0].description).toBe("Another annotation")

        await store.denotate("Another annotation")
        expect(denotateTask).toHaveBeenCalledTimes(3)
        expect(store.task.annotations.length).toBe(0)
    })

    test('task description patching', async () => {
        await store.editing(vi.mocked({ target: {name: 'description', value: 'Modified description', addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => { return true }} as EventTarget} as Event))
        expect(updateTask).toHaveBeenCalledExactlyOnceWith({uuid: task.uuid, description: 'Modified description'})
    })

    test('task project patching', async () => {
        await store.editing(vi.mocked({ target: {name: 'project', value: 'testproj', addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => { return true }} as EventTarget} as Event))
        expect(updateTask).toHaveBeenCalledExactlyOnceWith({uuid: task.uuid, project: 'testproj'})
    })

    test('task editing and saving on timeout', async () => {
        const target = document.createElement('input')
        document.body.appendChild(target)
        target.name = 'description'
        target.value = 'Modified description'
        const event = vi.mocked({ target: target as EventTarget} as Event)
        target.focus()
        await store.editing(event)
        expect(updateTask).toBeCalledTimes(0)
        vi.advanceTimersByTime(2000)
        await store.editing(event)
        expect(updateTask).toBeCalledTimes(0)
        vi.advanceTimersByTime(1000)
        expect(updateTask).toBeCalledTimes(0)
        vi.advanceTimersByTime(2000)
        expect(updateTask).toHaveBeenCalledOnce()
    })

    test('task editing and saving on unfocus', async () => {
        const target = document.createElement('input')
        const anotherTarget = document.createElement('input')
        document.body.appendChild(target)
        document.body.appendChild(anotherTarget)
        target.name = 'description'
        target.value = 'Modified description'
        anotherTarget.name = 'project'
        anotherTarget.value = 'testproj'
        const event = vi.mocked({ target: target as EventTarget} as Event)
        target.focus()
        await store.editing(event)
        expect(updateTask).toBeCalledTimes(0)
        vi.advanceTimersByTime(1000)
        expect(updateTask).toBeCalledTimes(0)
        anotherTarget.focus()
        await store.editing(event)
        expect(updateTask).toHaveBeenCalledOnce()
    })

    test('task completions', async () => {
        await store.update("post")
        expect(markTask).toHaveBeenCalledExactlyOnceWith(task.uuid, 'post')
    })

    test('task removing', async () => {
        await store.update("delete")
        expect(markTask).toHaveBeenCalledExactlyOnceWith(task.uuid, 'delete')
    })

    test('task depends', async () => {
        task.depends = [atask.uuid, aatask.uuid, 'something else']
        expect(store.depends).toStrictEqual(new Set([atask, aatask]))

        store.select(atask)
        expect(store.depends).toStrictEqual(new Set([]))
    })

    test('task blocks', async () => {
        atask.depends = [task.uuid, 'something else']
        aatask.depends = [task.uuid, 'another one']
        expect(store.blocks).toStrictEqual(new Set([atask, aatask]))

        store.select(atask)
        expect(store.blocks).toStrictEqual(new Set([]))
    })
})