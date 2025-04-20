<template>
    <div class="flex flex-row">
        <TasksList v-if="tasksStore.tasks.length" />

        <TaskDetails v-if="taskStore.task" />

        <button type="button" @click="tasksStore.createTask()" class="fixed bottom-4 right-4 flex items-center size-12 rounded-full bg-green-300 hover:bg-green-700 group duration-200 cursor-pointer">
            <span class="inline-block size-7 bg-no-repeat bg-center bg-contain svg-plus w-full group-hover:invert-100 duration-200"></span>
        </button>
    </div>
</template>

<script setup lang="ts">
import { useTaskStore } from 'tasks/store/task'
import { useTasksStore } from 'tasks/store/tasks'
import TasksList from 'tasks/components/task/list/TasksList.vue'
import TaskDetails from 'tasks/components/task/details/TaskDetails.vue'

const taskStore = useTaskStore()
const tasksStore = useTasksStore()
tasksStore.loadTasks()
</script>