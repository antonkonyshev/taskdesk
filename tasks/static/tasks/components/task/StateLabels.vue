<script setup lang="ts">
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import { Task } from '../../types/task'

const { task, labelClass, criticalLabelClass, commonLabelClass } = defineProps<{
    task: Task,
    labelClass: string,
    commonLabelClass: string,
    criticalLabelClass: string,
}>()

const { t } = useI18n()
</script>

<template>
    <span class="flex flex-col">
        <span v-if="task.wait" v-text="t('message.delayed_task')" :class="labelClass + ' ' + commonLabelClass"
            class="task-label"></span>

        <span v-if="task.depends.size" v-text="t('message.blocked_task')" :class="labelClass + ' ' + commonLabelClass"
            class="task-label"></span>

        <span v-if="task.blocks.size" v-text="t('message.blocking_tasks')"
            :class="labelClass + ' ' + criticalLabelClass" class="task-label"></span>
    </span>
</template>