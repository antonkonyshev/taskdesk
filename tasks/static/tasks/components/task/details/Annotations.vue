<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'
import { useTaskStore } from '../../../store/task'

const { t } = useI18n()
const store = useTaskStore()
const showAnnotationInput = ref(false)
</script>

<template>
    <p v-if="store.task.annotations.length">
        <span v-text="t('message.annotations')" class="font-semibold"></span>

        <span v-for="annotation in store.task.annotations" class="flex flex-row pt-1 gap-2">
            <span v-text="annotation.description" class="flex-1"></span>

            <span v-text="moment(annotation.entry).fromNow()"></span>

            <button type="button" @click="store.denotate(annotation.description)" class="group !py-0 cursor-pointer action-button !px-1 !rounded-md hover:bg-red-700 hover:!border-red-700 duration-200">
                <span class="inline-block size-4 bg-no-repeat bg-center bg-contain svg-trash group-hover:invert-100"></span>
            </button>
        </span>

        <button v-if="!showAnnotationInput" type="button" @click="showAnnotationInput = true" class="flex flex-row items-center gap-1 mt-1 hover:underline cursor-pointer">
            <span class="inline-block size-5 bg-no-repeat bg-center bg-contain svg-plus-circle mt-0.5"></span>

            <span v-text="t('message.add_annotation')"></span>
        </button>

        <input type="text" v-if="showAnnotationInput" :placeholder="t('message.enter_annotation_description')" name="annotate" class="w-full mt-1" @focusout="(event) => { store.annotate(event); showAnnotationInput = false }" @keypress.enter="(event) => { store.annotate(event); showAnnotationInput = false }" />
    </p>
</template>