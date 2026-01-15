import { config, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useTaskStore } from '../store/task'
import { useTasksStore } from 'tasks/store/tasks'
import { Annotation, Task } from 'tasks/types/task'
import { prepareTaskSocket, closeTaskSocket } from 'tasks/services/tasks.service'
import i18n from 'TaskDesk/js/i18n'
import Annotations from 'tasks/components/details/Annotations.vue'
import BlockedTasks from 'tasks/components/details/BlockedTasks.vue'
import Dependencies from 'tasks/components/details/Dependencies.vue'
import DatesDetails from 'tasks/components/details/DatesDetails.vue'
import TaskDetails from 'tasks/components/details/TaskDetails.vue'
import Actions from 'tasks/components/Actions.vue'
import StateLabels from 'tasks/components/StateLabels.vue'
import TasksList from 'tasks/components/list/TasksList.vue'
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'

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
            depends: [],
            annotations: []
        } as Task
        aatask = {
            id: 0,
            description: "Third testing task",
            uuid: "abc-def-3",
            urgency: 1.0,
            project: "test",
            depends: [],
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
            depends: [],
            annotations: [
                { entry: new Date(), description: "First annotation" } as Annotation,
                { entry: new Date(), description: "Second annotation" } as Annotation,
            ],
        } as Task
        const tasksStore = useTasksStore()
        tasksStore.tasks = [task, atask, aatask]
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

    test('empty annotation component', () => {
        store.select(atask)
        const wrapper = mount(Annotations)
        expect(wrapper.text()).toContain("Add annotation")
    })

    test('blocked tasks component', () => {
        aatask.depends = [store.task.uuid]
        const wrapper = mount(BlockedTasks)
        expect(wrapper.text()).toContain("Third testing task")
    })

    test('blocking tasks component', () => {
        task.depends = [atask.uuid]
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
        store.task.depends = [aatask.uuid]
        atask.depends = [task.uuid]
        const wrapper = mount(StateLabels, { propsData: {
            task: store.task,
            criticalLabelClass: 'critical-label-class',
            labelClass: 'all-label-class',
            commonLabelClass: 'common-label-class',
        }})
        expect(wrapper.text()).toContain('Blocked')
        expect(wrapper.text()).toContain('Delayed')
        expect(wrapper.text()).toContain('Blocking')
        expect(wrapper.html()).toContain('critical-label-class')
        expect(wrapper.html()).toContain('all-label-class')
        expect(wrapper.html()).toContain('common-label-class')
    })

    test('tasks list component', () => {
        const wrapper = mount(TasksList)
        expect(wrapper.text()).toContain("First testing task")
        expect(wrapper.text()).toContain("Second testing task")
        expect(wrapper.text()).toContain("Third testing task")
    })

    test('task creation button component', () => {
        const tasksStore = useTasksStore()
        const wrapper = mount(AddButton, { propsData: {
            addItem: () => { tasksStore.createTask() }
        }})
        expect(wrapper.html()).toContain("button")
        wrapper.find({ ref: "add-btn" }).trigger('click')
        expect(store.task.uuid).toBe('new')
        expect(store.task.description).toBe('')
        expect(tasksStore.tasks.length).toBe(4)
    })
})