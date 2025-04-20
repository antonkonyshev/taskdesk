<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Task } from 'tasks/types/task'
import { useTasksStore } from 'tasks/store/tasks';

const { task, labelClass, criticalLabelClass, commonLabelClass } = defineProps<{
    task: Task,
    labelClass: string,
    commonLabelClass: string,
    criticalLabelClass: string,
}>()

const { t } = useI18n()
const store = useTasksStore()
</script>

<template>
    <span class="flex flex-col">
        <span v-if="task.wait" v-text="t('message.delayed_task')" :class="labelClass + ' ' + commonLabelClass"
            class="task-label"></span>

        <span v-if="task.depending === true || store.isTaskDepending(task)" v-text="t('message.blocked_task')" :class="labelClass + ' ' + commonLabelClass"
            class="task-label"></span>

        <span v-if="task.blocking === true || store.isTaskBlocking(task)" v-text="t('message.blocking_tasks')"
            :class="labelClass + ' ' + criticalLabelClass" class="task-label"></span>
    </span>
</template>