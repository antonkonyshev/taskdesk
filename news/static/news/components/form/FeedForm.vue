<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Feed } from 'news/types/feed'

const { t } = useI18n()
const feed = defineModel<Feed>({ required: true })
const emit = defineEmits(['cancel', 'submit'])
const title = ref(feed.value.title)
const url = ref(feed.value.url)

const submit = () => {
    feed.value.title = title.value.trim()
    feed.value.url = url.value.trim()
    emit('submit')
}
</script>

<template>
    <div class="flex-1 lg:flex-2 my-3 mx-3 md:ml-3 px-4 py-3.5 bg-white min-h-screen shadow-[0px_0px_5px_-2px_#000] dark:bg-gray-800 dark:text-white">
        <form name="feedForm" @submit.prevent="submit">
            <p>
                <button type="button" @click="emit('cancel')" class="action-button hover:bg-gray-300" ref="cancel-btn">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-arrow-left dark:invert-100 dark:hover:invert-0"></span>
                </button>
            </p>

            <p class="mt-3">
                <label for="id_title" v-text="t('message.name')" />
                <input id="id_title" name="title" type="text" v-model="title"
                    :placeholder="t('message.feed_title_placeholder')"
                    class="input-field rounded-lg min-w-xs sm:min-w-sm md:min-w-md lg:min-w-lg xl:min-w-xl dark:!bg-gray-700" />
            </p>

            <p class="mt-2">
                <label for="id_url" v-text="t('message.url')" />
                <input id="id_url" name="url" type="url" v-model="url"
                    :placeholder="t('message.feed_url_placeholder')"
                    class="input-field rounded-lg min-w-xs sm:min-w-sm md:min-w-md lg:min-w-lg xl:min-w-xl dark:!bg-gray-700" />
            </p>

            <p class="mt-6">
                <button type="submit" @click.stop="submit()" v-text="t('message.save')" ref="submit-btn"
                    class="bg-green-700 hover:bg-green-600 text-white transition-colors duration-200 hover:cursor-pointer font-bold py-3 px-6 rounded-lg min-w-xs sm:min-w-sm">
                </button>
            </p>
        </form>
    </div>
</template>