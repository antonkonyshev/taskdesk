<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTaskStore } from 'tasks/store/task'

const { t } = useI18n()
const store = useTaskStore()
</script>

<template>
    <p v-if="store.blocks.size">
        <span v-text="t('message.this_task_blocks_the_following_tasks') + ':'" class="font-semibold"></span>

        <a v-for="task in store.blocks" href="#" v-text="task.description" @click="store.select(task)"
            class="block underline hover:text-green-700 hover:no-underline duration-200 py-0.5"></a>
    </p>
</template>