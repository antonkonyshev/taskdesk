import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useTasksStore } from '../store/tasks'
import { useTaskStore } from 'tasks/store/task'
import { 
    prepareTaskSocket, closeTaskSocket
} from 'tasks/services/tasks.service'
import i18n from 'TaskDesk/js/i18n'
import { fetchItems } from 'TaskDesk/js/common/service'

describe('tasks store', () => {
    let task = null
    let atask = null
    let aatask = null
    let store = null

    beforeEach(() => {
        vi.mock('tasks/services/tasks.service.ts')
        vi.mock('TaskDesk/js/common/service.ts')
        task = {
            id: 1,
            description: "First testing task",
            uuid: "abc-def-1",
            urgency: 3.0,
            project: "test",
            depends: [],
        }
        atask = {
            id: 2,
            description: "Second testing task",
            uuid: "abc-def-2",
            urgency: 2.0,
            project: "test",
            depends: ["abc-def-1"],
        }
        aatask = {
            id: 0,
            description: "Third testing task",
            uuid: "abc-def-3",
            urgency: 1.0,
            project: "test",
            depends: ["abc-def-1", "abc-def-2"],
        }
        vi.mocked(prepareTaskSocket).mockResolvedValue({})
        vi.mocked(closeTaskSocket).mockResolvedValue()
        vi.mocked(fetchItems).mockResolvedValue([task, atask, aatask])
        setActivePinia(createPinia())
        store = useTasksStore()
        config.global.plugins = [i18n]
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('tasks fetching', async () => {
        expect(store.tasks.length).toBe(0)
        await store.loadTasks()
        expect(store.tasks.length).toBe(3)
        expect(store.tasks[0].id).toBe(1)
        expect(store.tasks[1].description).toBe("Second testing task")
        expect(store.tasks[2].uuid).toBe("abc-def-3")
    })

    test('task refreshing', async () => {
        await store.loadTasks()
        await store.refreshTask(
            {uuid: "abc-def-3", id: 3, description: "Refreshed testing task"})
        expect(store.tasks[2].id).toBe(3)
        expect(store.tasks[2].description).toBe("Refreshed testing task")

        store.tasks.unshift({uuid: 'new', description: 'New testing task'})
        await store.refreshTask(
            {uuid: "abc-def-4", id: 4, description: "New stored testing task"})
        expect(store.tasks[0].id).toBe(4)
        expect(store.tasks[0].uuid).toBe("abc-def-4")
        expect(store.tasks[0].description).toBe("New stored testing task")
    })

    test('tasks dependencies', async () => {
        await store.loadTasks()
        const task1 = store.tasks[0]
        const task2 = store.tasks[1]
        const task3 = store.tasks[2]

        expect(task1.id).toBe(1)
        expect(store.isTaskDepending(task1)).toBe(false)
        expect(store.isTaskBlocking(task1)).toBe(true)

        expect(task2.id).toBe(2)
        expect(store.isTaskDepending(task2)).toBe(true)
        expect(store.isTaskBlocking(task2)).toBe(true)

        expect(task3.id).toBe(0)
        expect(store.isTaskDepending(task3)).toBe(true)
        expect(store.isTaskBlocking(task3)).toBe(false)
    })

    test('tasks removing', async () => {
        await store.loadTasks()
        const task1 = store.tasks[0]
        const task2 = store.tasks[1]
        const task3 = store.tasks[2]

        await store.removeTask(task2)
        expect(store.tasks.length).toBe(2)

        expect(task1.id).toBe(1)
        expect(store.isTaskDepending(task1)).toBe(false)
        expect(store.isTaskBlocking(task1)).toBe(true)

        expect(task3.id).toBe(0)
        expect(store.isTaskDepending(task3)).toBe(true)
        expect(store.isTaskBlocking(task3)).toBe(false)

        await store.removeTask(task1)
        expect(store.tasks.length).toBe(1)

        expect(task3.id).toBe(0)
        expect(store.isTaskDepending(task3)).toBe(false)
        expect(store.isTaskBlocking(task3)).toBe(false)
    })

    test('default task selection', async () => {
        const tStore = useTaskStore()
        expect(tStore.task).toBe(null)
        await store.loadTasks()
        expect(tStore.task).toBe(null)
    })
})