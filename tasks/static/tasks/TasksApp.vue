<template>
    <div v-for="task in sortedTasks" :key="task.id" class="border-b-gray-300 border-b hover:bg-gray-300 cursor-pointer duration-200 dark:bg-gray-700 dark:text-white dark:hover:text-gray-700 p-3">
        <h2 class="font-semibold flex flex-row justify-between items-center">
            <span class="flex items-center">
                <span v-text="task.description" class="text-lg"></span>
                <span v-if="task.blocking" v-text="t('message.blocking_tasks')" class="bg-red-700 text-white text-xs px-2 py-0.5 rounded-xl ml-2.5"></span>
            </span>
            <span v-if="task.project" v-text="task.project" class="bg-gray-200 text-xs px-2 py-0.5 rounded-xl"></span>
        </h2>
        <ul v-if="task.tags" class="flex flex-row flex-wrap gap-2">
            <li v-for="tag in task.tags" v-text="tag" class="bg-gray-200 text-xs px-2 py-0.5 rounded-xl"></li>
        </ul>
        <span v-if="task.due" v-text="formatDate(task.due)"></span>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'

const { t } = useI18n()

interface Task {
    id: number
    description: string
    urgency: number
    project?: string
    tags?: Array<string>
    due?: Date
    blocking?: Array<number>
}

// TODO: fetch tasks from the backend API endpoint
const tasks = ref([{ id: 1, description: "Test 1", project: "td", tags: ["next"], due: new Date(new Date().getTime() + 2 * 86400000), urgency: 32.6, blocking: [4, 5] } as Task,
    { id: 2, description: "Test 2", project: "ak", due: new Date(new Date().getTime() + 3 * 3600000), urgency: 24.3, blocking: [6]  } as Task,
    { id: 3, description: "Test 3", tags: ["next", "call"], urgency: 16.93 } as Task])

const sortedTasks = computed(() => {
    const tasksCopy = [...tasks.value]
    return tasksCopy.sort((prv, nxt) => nxt.urgency - prv.urgency)
})

onMounted(() => {
    console.log("TasksApp mounted")
})

function formatDate(value: Date): string {
    return moment(value).fromNow()
}
</script>