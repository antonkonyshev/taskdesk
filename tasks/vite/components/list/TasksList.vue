<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'
import { useTaskStore } from 'tasks/store/task'
import { useTasksStore } from 'tasks/store/tasks'
import StateLabels from 'tasks/components/partials/StateLabels.vue'

const { t } = useI18n()
const taskStore = useTaskStore()
const tasksStore = useTasksStore()
</script>

<template>
    <div class="flex-1 overflow-y-scroll scroll-smooth overflow-x-clip [overflow-clip-margin:10px] max-h-[calc(100vh_+_0.75rem)] md:-ml-6 md:pl-6">
        <div v-for="task in tasksStore.tasks" :key="task.uuid" @click="taskStore.select(task)"
            :class="{ '!shadow-lg !scale-[102%]': (taskStore.task && task.uuid === taskStore.task.uuid) }"
            class="my-3 p-3 md:mx-4 shadow-black shadow-xs bg-white hover:shadow-md hover:scale-[101%] dark:bg-gray-800 dark:text-white duration-200 cursor-pointer wrap-break-word">

            <h2 class="font-semibold flex flex-row justify-between items-start gap-2">
                <span v-text="task.description" class="text-lg flex-1"
                    :class="{ 'text-gray-600': task.depending === true || tasksStore.isTaskDepending(task) || task.wait }"></span>

                <StateLabels :task="task" class="gap-1" label-class="text-xs" common-label-class="bg-gray-200 dark:bg-gray-700"
                    critical-label-class="bg-red-700 text-white" shorten-labels="400" />
            </h2>

            <ul v-if="task.tags" class="flex flex-row flex-wrap gap-2 py-1">
                <li v-for="tag in task.tags" v-text="tag" class="bg-gray-200 dark:bg-gray-700 text-xs task-label"></li>
                <li v-if="!task.due && task.project" v-text="task.project" class="bg-gray-200 text-xs task-label ml-auto"></li>
            </ul>

            <p class="flex flex-row gap-1 items-center justify-end" v-if="task.due || task.project">
                <span v-if="task.due"
                    v-text="task.due ? (t('message.due_date') + ' ' + moment(task.due).fromNow()) : ''"
                    class="flex-1"></span>

                <span v-if="task.project" v-text="task.project"
                    class="bg-gray-200 dark:bg-gray-700 text-xs task-label !pb-1"></span>
            </p>
        </div>
    </div>
</template>