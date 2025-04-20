import { config, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useTaskStore } from '../store/task'
import { useTasksStore } from 'tasks/store/tasks'
import { Annotation, Task } from 'tasks/types/task'
import { prepareTaskSocket, closeTaskSocket } from 'tasks/services/tasks.service'
import i18n from 'TaskDesk/js/i18n'
import Annotations from 'tasks/components/task/details/Annotations.vue'
import BlockedTasks from 'tasks/components/task/details/BlockedTasks.vue'
import Dependencies from 'tasks/components/task/details/Dependencies.vue'
import DatesDetails from 'tasks/components/task/details/DatesDetails.vue'
import TaskDetails from 'tasks/components/task/details/TaskDetails.vue'
import Actions from 'tasks/components/task/Actions.vue'
import StateLabels from 'tasks/components/task/StateLabels.vue'
import TasksList from 'tasks/components/task/list/TasksList.vue'

describe('tasks components rendering', () => {
    let task = null
    let atask = null
    let aatask = null
    let store = null

    beforeEach(() => {
        vi.mock('tasks/services/tasks.service.ts')
        vi.mocked(prepareTaskSocket).mockResolvedValue({})
        vi.mocked(closeTaskSocket).mockResolvedValue()
        setActivePinia(createPinia())
        config.global.plugins = [i18n]
        atask = {
            id: 2,
            description: "Second testing task",
            uuid: "abc-def-2",
            urgency: 2.0,
            project: "test",
            depends: new Set(),
            blocks: new Set(),
        } as Task
        aatask = {
            id: 0,
            description: "Third testing task",
            uuid: "abc-def-3",
            urgency: 1.0,
            project: "test",
            depends: new Set(),
            blocks: new Set(),
        } as Task
        task = {
            id: 1,
            description: "First testing task",
            uuid: "abc-def-1",
            urgency: 3.0,
            project: "testproj",
            entry: new Date(),
            due: new Date(),
            wait: new Date(),
            tags: ["next"],
            depends: new Set([atask]),
            blocks: new Set([aatask]),
            annotations: [
                { entry: new Date(), description: "First annotation" } as Annotation,
                { entry: new Date(), description: "Second annotation" } as Annotation,
            ],
        } as Task
        store = useTaskStore()
        store.select(task)
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('annotation component', () => {
        const wrapper = mount(Annotations)
        expect(wrapper.text()).toContain("First annotation")
        expect(wrapper.text()).toContain("Second annotation")
        expect(wrapper.text()).toContain("a few seconds ago")
        expect(wrapper.text()).toContain("Add annotation")
    })

    test('blocked tasks component', () => {
        const wrapper = mount(BlockedTasks)
        expect(wrapper.text()).toContain("Third testing task")
    })

    test('blocking tasks component', () => {
        const wrapper = mount(Dependencies)
        expect(wrapper.text()).toContain("Second testing task")
    })

    test('task dates component', () => {
        const wrapper = mount(DatesDetails)
        expect(wrapper.text()).toContain("Created")
        expect(wrapper.text()).toContain("Will become active")
        expect(wrapper.text()).toContain("Due date")
        expect(wrapper.text()).toContain("a few seconds ago")
    })

    test('task details component', () => {
        const wrapper = mount(TaskDetails)
        expect(wrapper.html()).toContain("First testing task")
        expect(wrapper.html()).toContain("testproj")
        expect(wrapper.html()).toContain("next")
    })

    test('task actions component', () => {
        const wrapper = mount(Actions)
        expect(wrapper.html()).toContain('svg-arrow-left')
        expect(wrapper.html()).toContain('svg-trash')
        expect(wrapper.html()).toContain('svg-check')
    })

    test('task state labels component', () => {
        const wrapper = mount(StateLabels, { propsData: {
            task: store.task,
            criticalLabelClass: 'critical-label-class',
            labelClass: 'all-label-class',
            commonLabelClass: 'common-label-class',
        }})
        expect(wrapper.text()).toContain('Blocked task')
        expect(wrapper.text()).toContain('Delayed task')
        expect(wrapper.text()).toContain('Blocking task')
        expect(wrapper.html()).toContain('critical-label-class')
        expect(wrapper.html()).toContain('all-label-class')
        expect(wrapper.html()).toContain('common-label-class')
    })

    test('tasks list component', () => {
        const tasksStore = useTasksStore()
        tasksStore.tasks = [task, atask, aatask]
        const wrapper = mount(TasksList)
        expect(wrapper.text()).toContain("First testing task")
        expect(wrapper.text()).toContain("Second testing task")
        expect(wrapper.text()).toContain("Third testing task")
    })
})