<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'
import { useTaskStore } from '../../../store/task'
import { useTasksStore } from '../../../store/tasks'
import StateLabels from '../StateLabels.vue'

const { t } = useI18n()
const taskStore = useTaskStore()
const tasksStore = useTasksStore()
</script>

<template>
    <div class="flex-1 overflow-y-scroll scroll-smooth max-h-screen">
        <div v-for="task in tasksStore.tasks" :key="task.uuid" @click="taskStore.select(task)"
            :class="{ 'bg-gray-100': (taskStore.task && task.uuid === taskStore.task.uuid) }"
            class="border-b-gray-400 border-b hover:bg-gray-300 cursor-pointer duration-200 dark:bg-gray-700 dark:text-white dark:hover:text-gray-700 p-3">

            <h2 class="font-semibold flex flex-row justify-between items-center gap-2">
                <span v-text="task.description" class="text-lg flex-1"
                    :class="{ 'text-gray-600': task.depends.size || task.wait }"></span>

                <StateLabels :task="task" class="gap-1" label-class="text-xs" common-label-class="bg-gray-200"
                    critical-label-class="bg-red-700 text-white" />
            </h2>

            <ul v-if="task.tags" class="flex flex-row flex-wrap gap-2 py-1">
                <li v-for="tag in task.tags" v-text="tag" class="bg-gray-200 text-xs task-label"></li>
            </ul>

            <p class="flex flex-row gap-1 items-center">
                <span v-text="task.due ? (t('message.due_date') + ' ' + moment(task.due).fromNow()) : ''"
                    class="flex-1"></span>

                <span v-if="task.project" v-text="task.project" class="bg-gray-200 text-xs task-label !pb-1"></span>
            </p>
        </div>
    </div>
</template>