import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useTaskStore } from '../store/task'
import { Task } from 'tasks/types/task'
import { 
    prepareTaskSocket, closeTaskSocket, annotateTask, denotateTask, updateTask,
    markTask
} from 'tasks/services/tasks.service'
import i18n from 'TaskDesk/js/i18n'

describe('task store', () => {
    let task = null
    let atask = null
    let aatask = null

    beforeEach(() => {
        vi.mock('tasks/services/tasks.service.ts')
        vi.mocked(prepareTaskSocket).mockResolvedValue({})
        vi.mocked(closeTaskSocket).mockResolvedValue()
        setActivePinia(createPinia())
        config.global.plugins = [i18n]
        task = {
            id: 1,
            description: "First testing task",
            uuid: "abc-def-1",
            urgency: 3.0,
            project: "test",
            depends: new Set(),
            blocks: new Set(),
            annotations: [],
        } as Task
        atask = {
            id: 2,
            description: "Second testing task",
            uuid: "abc-def-2",
            urgency: 2.0,
            project: "test",
            depends: new Set(),
            blocks: new Set(),
            annotations: [],
        } as Task
        aatask = {
            id: 0,
            description: "Third testing task",
            uuid: "abc-def-3",
            urgency: 1.0,
            project: "test",
            depends: new Set(),
            blocks: new Set(),
            annotations: [],
        } as Task
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('task selection', () => {
        const store = useTaskStore()
        expect(store.task).toBe(null)
        store.select(task)
        expect(store.task.id).toBe(1)
        expect(store.task.description).toBe("First testing task")
        expect(store.task.uuid).toBe("abc-def-1")
    })


    test('tasks navigation history', () => {
        const store = useTaskStore()
        store.select(task)
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
    })

    test('task annotations', async () => {
        const store = useTaskStore()
        store.select(task)
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
        const store = useTaskStore()
        store.select(task)
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
        const store = useTaskStore()
        store.select(task)
        await store.editing(vi.mocked({ target: {name: 'description', value: 'Modified description', addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => { return true }} as EventTarget} as Event))
        expect(updateTask).toHaveBeenCalledExactlyOnceWith({uuid: task.uuid, description: 'Modified description'})
    })

    test('task project patching', async () => {
        const store = useTaskStore()
        store.select(task)
        await store.editing(vi.mocked({ target: {name: 'project', value: 'testproj', addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => { return true }} as EventTarget} as Event))
        expect(updateTask).toHaveBeenCalledExactlyOnceWith({uuid: task.uuid, project: 'testproj'})
    })

    test('task completions', async () => {
        const store = useTaskStore()
        store.select(task)
        await store.update("post")
        expect(markTask).toHaveBeenCalledExactlyOnceWith(task.uuid, 'post')
    })

    test('task removing', async () => {
        const store = useTaskStore()
        store.select(task)
        await store.update("delete")
        expect(markTask).toHaveBeenCalledExactlyOnceWith(task.uuid, 'delete')
    })
})