<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useWindowSize } from '@vueuse/core'
import { Task } from '../types/task'
import { useTasksStore } from '../store/tasks';

const {
    task, labelClass, criticalLabelClass, commonLabelClass, shortenLabels,
    allowRowArrangement
} = defineProps<{
    task: Task,
    labelClass: string,
    commonLabelClass: string,
    criticalLabelClass: string,
    shortenLabels?: string,
    allowRowArrangement?: string,
}>()

const { t } = useI18n()
const { width } = useWindowSize()
const store = useTasksStore()
</script>

<template>
    <span class="flex flex-col" :class="{'flex-row xl:flex-col': allowRowArrangement}">
        <span v-if="task.wait" :class="labelClass + ' ' + commonLabelClass" class="task-label">
            {{ (shortenLabels && width < +shortenLabels) ? t('message.delayed') : t('message.delayed_task') }}
        </span>

        <span v-if="task.depending === true || store.isTaskDepending(task)"
              :class="labelClass + ' ' + commonLabelClass" class="task-label">
            {{ (shortenLabels && width < +shortenLabels) ? t('message.blocked') : t('message.blocked_task') }}
        </span>

        <span v-if="task.blocking === true || store.isTaskBlocking(task)"
              :class="labelClass + ' ' + criticalLabelClass" class="task-label">
            {{ (shortenLabels && width < +shortenLabels) ? t('message.blocking') : t('message.blocking_tasks') }}
        </span>
    </span>
</template>