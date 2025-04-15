<template>
    <div class="flex flex-row">
        <div class="flex-1">
            <div v-for="task in sortedTasks" :key="task.id" @click="selectTask(task)" class="border-b-gray-300 border-b hover:bg-gray-300 cursor-pointer duration-200 dark:bg-gray-700 dark:text-white dark:hover:text-gray-700 p-3">
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
        </div>

        <div v-if="selectedTask" class="flex-1 lg:flex-2 p-4 border-l border-l-gray-300 hidden sm:block">
            <h2 class="font-semibold text-2xl flex flex-row items-center">
                <span class="flex-1">{{ selectedTask.description }}</span>
                <span v-if="selectedTask.blocking" v-text="t('message.blocking_tasks')" class="bg-red-200 px-2 py-0.5 rounded-xl text-lg"></span>
            </h2>

            <p v-if="selectedTask.project || selectedTask.tags" class="flex flex-row items-center pt-3 gap-2">
                <span class="flex-1">{{ t('message.project') }}: {{ selectedTask.project ? selectedTask.project : t("message.not_specified").toLowerCase() }}</span>
                <span v-if="selectedTask.tags" v-for="tag in selectedTask.tags" v-text="tag" class="bg-gray-200 px-2 pb-0.5 rounded-xl"></span>
            </p>

            <p v-if="selectedTask.due || selectedTask.entered" class="flex flex-col items-start lg:flex-row justify-between lg:items-center">
                <span v-if="selectedTask.due">{{ t("message.due_date") }}: {{ formatDate(selectedTask.due) }}</span>
                <span v-if="selectedTask.entered">{{ t("message.creation_date") }}: {{ formatDate(selectedTask.entered) }}</span>
            </p>
        </div>
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
    entered?: Date
    blocking?: Array<number>
}

// TODO: fetch tasks from the backend API endpoint
const tasks = ref([{ id: 1, description: "Test 1", project: "td", tags: ["next"], due: new Date(new Date().getTime() + 2 * 86400000), entered: new Date(new Date().getTime() - 21 * 86400000), urgency: 32.6, blocking: [4, 5] } as Task,
    { id: 2, description: "Test 2", project: "ak", due: new Date(new Date().getTime() + 3 * 3600000), urgency: 24.3, blocking: [6]  } as Task,
    { id: 3, description: "Test 3", tags: ["next", "call"], entered: new Date(new Date().getTime() - 4 * 86400000), urgency: 16.93 } as Task])

const sortedTasks = computed(() => {
    const tasksCopy = [...tasks.value]
    return tasksCopy.sort((prv, nxt) => nxt.urgency - prv.urgency)
})

const selectedTask = ref(null)

onMounted(() => {
    // TODO: move this initialization to the endpoint's response processing
    if (sortedTasks.value.length && !selectedTask.value) {
        selectTask(sortedTasks.value[0])
    }
})

function formatDate(value: Date): string {
    return moment(value).fromNow()
}

function selectTask(task: Task) {
    selectedTask.value = task
}
</script>