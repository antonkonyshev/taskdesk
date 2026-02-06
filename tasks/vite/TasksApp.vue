<template>
    <div class="flex flex-row">
        <TasksList v-if="(!taskStore.task || width >= mdWidth) && tasksStore.tasks.length" />

        <TaskDetails v-if="taskStore.task" />

        <Toolbar :show-add-task="false">
            <TasksToolbarActions v-if="(!taskStore.task || taskStore.task.uuid != 'new') && !taskStore.notification" />
        </Toolbar>
    </div>
</template>

<script setup lang="ts">
import { useTaskStore } from 'tasks/store/task'
import { useTasksStore } from 'tasks/store/tasks'
import { useWindowSize } from '@vueuse/core'
import { useRoute } from 'vue-router'
import Toolbar from 'TaskDesk/js/common/components/Toolbar.vue'
import TasksList from 'tasks/components/list/TasksList.vue'
import TaskDetails from 'tasks/components/details/TaskDetails.vue'
import TasksToolbarActions from './components/partials/TasksToolbarActions.vue'

const route = useRoute()
const taskStore = useTaskStore()
const tasksStore = useTasksStore()
const { width } = useWindowSize()
const mdWidth = 768;

async function initialize() {
    await tasksStore.loadTasks()
    if (route.params.uuid == 'new') {
        tasksStore.createTask()
    } else {
        let idx = -1
        if (route.params.uuid) {
            idx = tasksStore.tasks.findIndex(elem => elem.uuid == route.params.uuid)
        }
        if (idx < 0 && !taskStore.task && width.value >= mdWidth && tasksStore.tasks.length) {
            idx = 0
        }
        if (idx >= 0) {
            taskStore.select(tasksStore.tasks[idx])
        }
    }
}

initialize()
</script>