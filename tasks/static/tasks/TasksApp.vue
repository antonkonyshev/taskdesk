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
import TasksList from 'tasks/components/list/TasksList.vue'
import TaskDetails from 'tasks/components/details/TaskDetails.vue'
import AddButton from './components/AddButton.vue'

const taskStore = useTaskStore()
const tasksStore = useTasksStore()
tasksStore.loadTasks()
</script>