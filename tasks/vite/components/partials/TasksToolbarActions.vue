<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTasksStore } from 'tasks/store/tasks';

const { t } = useI18n()
const store = useTasksStore()
</script>

<template>
    <ul class="flex flex-row justify-end items-center text-center xs:gap-3 xs:px-3 sm:gap-5 sm:px-5 md:gap-6 md:px-6 border-l-gray-300 border-l" role="menu">
        <li role="menuitem">
            <a href="" @click.stop.prevent="store.createTask"
                class="navigation-button flex !flex-col !px-4">

                <span class="navigation-icon !mx-0 svg-plus-circle"></span>
                <span class="text-sm" v-text="t('message.add_task')"></span>
            </a>
        </li>
    </ul>
</template>