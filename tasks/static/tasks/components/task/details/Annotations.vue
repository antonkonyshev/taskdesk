<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'
import { useTaskStore } from '../../../store/task'

const { t } = useI18n()
const store = useTaskStore()
</script>

<template>
    <p v-if="store.task.annotations.length">
        <span v-text="t('message.annotations')" class="font-semibold"></span>

        <ul>
            <li v-for="annotation in store.task.annotations" class="flex flex-row">
                <span v-text="annotation.description" class="flex-1"></span>

                <span v-text="moment(annotation.entry).fromNow()"></span>
            </li>
        </ul>
    </p>
</template>