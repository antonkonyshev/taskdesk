<template>
    <div class="flex flex-row">
        <TasksList v-if="tasksStore.tasks.length" />

        <TaskDetails v-if="taskStore.task" />

        <AddButton v-if="!taskStore.task || taskStore.task.uuid != 'new'" />
    </div>
</template>

<script setup lang="ts">
import { useTaskStore } from 'tasks/store/task'
import { useTasksStore } from 'tasks/store/tasks'
import TasksList from 'tasks/components/task/list/TasksList.vue'
import TaskDetails from 'tasks/components/task/details/TaskDetails.vue'
import AddButton from './components/task/AddButton.vue'

const taskStore = useTaskStore()
const tasksStore = useTasksStore()
tasksStore.loadTasks()
</script>