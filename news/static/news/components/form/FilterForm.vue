<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Filter } from 'news/types/filter'

const { t } = useI18n()
const filter = defineModel<Filter>({ required: true })
const emit = defineEmits(['cancel', 'submit'])
const entry = ref(filter.value.entry)
const part = ref(filter.value.part)

const submit = () => {
    filter.value.entry = entry.value.trim()
    filter.value.part = part.value.trim()
    emit('submit')
}
</script>

<template>
    <div class="flex-1 lg:flex-2 my-3 mx-3 md:!ml-0 px-4 py-3.5 bg-white min-h-screen shadow-[0px_0px_5px_-2px_#000]">
        <form name="filterForm" @submit.prevent="submit">
            <p>
                <button type="button" @click="emit('cancel')" class="action-button hover:bg-gray-300" ref="cancel-btn">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-arrow-left"></span>
                </button>
            </p>

            <p class="mt-3">
                <label for="id_entry" v-text="t('message.word')" />
                <input id="id_entry" name="entry" type="text" v-model="entry"
                    :placeholder="t('message.filter_entry_placeholder')"
                    class="input-field rounded-lg min-w-xs sm:min-w-sm md:min-w-md lg:min-w-lg xl:min-w-xl" />
            </p>

            <p class="mt-2">
                <label for="id_part" v-text="t('message.part_of_word')" />
                <select id="id_part" name="part" v-model="part"
                    class="input-field rounded-lg min-w-xs sm:min-w-sm md:min-w-md lg:min-w-lg xl:min-w-xl">
                    <option value="start" v-text="t('message.word_start')"></option>
                    <option value="end" v-text="t('message.word_end')"></option>
                    <option value="full" v-text="t('message.word_full')"></option>
                    <option value="part" v-text="t('message.word_part')"></option>
                </select>
            </p>

            <p class="mt-6">
                <button type="submit" @click="submit()" v-text="t('message.save')" ref="submit-btn"
                    class="bg-green-700 hover:bg-green-600 text-white transition-colors duration-200 hover:cursor-pointer font-bold py-3 px-6 rounded-lg min-w-xs sm:min-w-sm">
                </button>
            </p>
        </form>
    </div>
</template>