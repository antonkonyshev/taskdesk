<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'
import { useNewsStore } from 'news/store/news'
import { closeNewsSocket } from 'news/services/news.service'

const { t } = useI18n()
const store = useNewsStore()

const route = useRoute()
watch(() => route.path, (nextPath, prevPath) => {
    if (nextPath != prevPath && ['/', '/news', '/news/', '/news/reading', '/news/reading/'].indexOf(prevPath) >= 0) {
        closeNewsSocket()
    }
})
</script>

<template>
    <div class="flex-1 overflow-y-scroll scroll-smooth overflow-x-hidden max-h-[calc(100vh_+_0.75rem)] md:-ml-6 md:pl-6">
        <a v-for="news in store.news" :key="news.id"
            :href="news.link" target="_blank"
            class="flex flex-row my-3 p-3 md:mx-4 shadow-black shadow-xs bg-white hover:shadow-md hover:scale-[101%] dark:bg-gray-800 dark:text-white duration-200 cursor-pointer">

            <span class="flex flex-col">
                <span class="font-semibold flex flex-row justify-between items-start gap-2">
                    <span v-text="news.title" class="text-lg flex-1"></span>

                    <span v-text="news.description" class="text-md flex-1"></span>
                </span>

                <span class="flex flex-row gap-1 items-center" v-if="news.published">
                    <span v-text="news.published ? (t('message.due_date') + ' ' + moment(news.published).fromNow()) : ''"
                        class="flex-1"></span>
                </span>
            </span>
            ,
            <img v-if="news.enclosure" :src="news.enclosure" :alt="news.title" />
        </a>
    </div>
</template>