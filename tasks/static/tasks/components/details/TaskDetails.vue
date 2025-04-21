<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTaskStore } from 'tasks/store/task'
import Actions from 'tasks/components/Actions.vue'
import StateLabels from 'tasks/components/StateLabels.vue'
import Dependencies from 'tasks/components/details/Dependencies.vue'
import BlockedTasks from 'tasks/components/details/BlockedTasks.vue'
import Annotations from 'tasks/components/details/Annotations.vue'
import DatesDetails from 'tasks/components/details/DatesDetails.vue'

const { t } = useI18n()
const store = useTaskStore()
</script>

<template>
    <div class="flex-1 lg:flex-2 px-4 py-3.5 border-l border-gray-400 min-h-screen">
        <Actions />

        <h2 class="font-semibold text-2xl flex flex-row gap-2 items-center pt-4 pb-3">
            <input type="text" class="flex-1 outline-none focus-visible:!outline-none" name="description"
                id="id_description" @focusout="store.editing" @focusin="store.editing" @input="store.editing"
                :placeholder="t('message.enter_task_description')"
                :value="store.task.description" />

            <StateLabels :task="store.task" class="gap-2" label-class="text-lg" common-label-class="bg-gray-200"
                critical-label-class="bg-red-200" />
        </h2>

        <p v-if="store.task.uuid != 'new'" class="flex flex-row items-center gap-2">
            <span v-text="t('message.project') + ':'"></span>

            <input type="text" class="flex-1 outline-none focus-visible:!outline-none" name="project"
                :placeholder="t('message.not_specified').toLowerCase()" @focusout="store.editing"
                @focusin="store.editing" @input="store.editing" :value="store.task.project" />

            <span v-if="store.task.tags" v-for="tag in store.task.tags" v-text="tag"
                class="bg-gray-200 task-label !pt-0"></span>
        </p>

        <DatesDetails />
        <Dependencies class="pt-4" />
        <BlockedTasks class="pt-4" />
        <Annotations class="pt-4" v-if="store.task.uuid != 'new'" />
    </div>
</template>