<template>
    <div class="flex flex-row">
        <TasksList v-if="tasksStore.tasks.length" />

        <TaskDetails v-if="taskStore.task" />
    </div>
</template>

<script setup lang="ts">
import { useTaskStore } from './store/task'
import { useTasksStore } from './store/tasks'
import TasksList from './components/task/list/TasksList.vue'
import TaskDetails from './components/task/details/TaskDetails.vue'

const taskStore = useTaskStore()
const tasksStore = useTasksStore()
tasksStore.fetchTasks()
</script>