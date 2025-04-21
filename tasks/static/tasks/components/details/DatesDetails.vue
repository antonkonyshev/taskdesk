<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'
import { useTaskStore } from 'tasks/store/task'

const { t } = useI18n()
const store = useTaskStore()
</script>

<template>
    <p v-if="store.task.entry || store.task.due || store.task.wait" class="flex flex-col items-start">
        <span v-if="store.task.entry || store.task.due"
            class="flex flex-col items-start justify-between w-full lg:flex-row lg:items-center">
            <span v-if="store.task.due">{{ t("message.due_date") }} {{ moment(store.task.due).fromNow() }}</span>

            <span v-if="store.task.entry">{{ t("message.created") }} {{ moment(store.task.entry).fromNow() }}</span>
        </span>

        <span v-if="store.task.wait">
            {{ t("message.will_become_active") }} {{ moment(store.task.wait).fromNow() }}
        </span>
    </p>
</template>