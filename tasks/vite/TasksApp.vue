<template>
    <div class="flex flex-row">
        <TasksList v-if="(!taskStore.task || width >= mdWidth) && tasksStore.tasks.length" />

        <TaskDetails v-if="taskStore.task" />

        <AddButton v-if="(!taskStore.task || taskStore.task.uuid != 'new') && !taskStore.notification" :add-item="tasksStore.createTask" />
    </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useTaskStore } from 'tasks/store/task'
import { useTasksStore } from 'tasks/store/tasks'
import { useWindowSize } from '@vueuse/core'
import TasksList from 'tasks/components/list/TasksList.vue'
import TaskDetails from 'tasks/components/details/TaskDetails.vue'
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'

const taskStore = useTaskStore()
const tasksStore = useTasksStore()
const { width } = useWindowSize()
const mdWidth = 768;

function onViewportResize() {
    if (width.value >= mdWidth && !taskStore.task && tasksStore.tasks.length) {
        taskStore.select(tasksStore.tasks[0])
    }
}

watch(width, onViewportResize)

async function initialize() {
    await tasksStore.loadTasks()
    onViewportResize()
}
initialize()
</script>