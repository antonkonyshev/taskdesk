<template>
    <div class="flex flex-row">
        <TasksList v-if="store.tasks.length" />

        <TaskDetails v-if="store.task" />
    </div>
</template>

<script setup lang="ts">
import { useTaskStore } from './store/task'
import TasksList from './components/task/list/TasksList.vue'
import TaskDetails from './components/task/details/TaskDetails.vue'

const store = useTaskStore()
store.fetchTasks()
</script>