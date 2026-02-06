<script setup lang="ts">
import { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'
import { useFeedStore } from 'news/store/feed'
import { News } from 'news/types/news'

const emit = defineEmits(['hide', 'bookmark'])
defineProps({
    news: { type: Object as PropType<News>, required: true },
    isFolded: { type: Boolean, default: false },
    
})

const { t } = useI18n()
const feedStore = useFeedStore()

const newsFeedTitle = (id: number) => {
    const feed = feedStore.feeds.find((elem) => elem.id == id)
    return feed ? (feed.title || feed.url) : ''
}
</script>

<template>
    <span class="flex flex-col gap-3 md:gap-4 lg:gap-5 sm:flex-row">
        <span class="flex flex-col gap-1 sm:gap-2 flex-1 wrap-break-word">
            <span class="font-semibold flex flex-row justify-between items-start gap-2">
                <span v-text="news.title" class="text-lg"></span>
            </span>
            
            <span v-html="news.description"
                class="text-md flex-1 max-h-6 sm:!max-h-[60vh] overflow-y-hidden duration-300"
                :class="{'max-h-[60vh]': !isFolded}"
                ></span>

            <span v-if="isFolded" class="mx-auto unfold-button sm:!hidden bg-white dark:bg-gray-800 !py-0 -mt-5 group">
                <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-chevron-down group-hover:invert-100 dark:invert-100"></span>
            </span>

            <span class="hidden sm:flex sm:flex-row">
                <span v-text="newsFeedTitle(news.feed)" class="flex-1"></span>

                <span v-text="news.published ? (t('message.published') + ' ' + moment(news.published).fromNow()) : ''"></span>
            </span>
        </span>

        <span class="flex flex-col gap-2 sm:order-first min-w-[30%] lg:min-w-[310px] min-h-[200px] sm:min-h-auto md:min-h-[150px] lg:min-h-[150px]"
            :class="{'min-h-auto sm:hidden': !news.enclosure_url}">
            <span v-if="news.enclosure_url"
                class="flex flex-1 w-full bg-cover bg-center bg-no-repeat"
                :style="{'background-image': 'url(\'' + news.enclosure_url + '\')'}"></span>

            <span class="flex flex-row sm:flex-col sm:hidden">
                <span v-text="newsFeedTitle(news.feed)" class="flex-1"></span>

                <span
                    v-text="news.published ? (t('message.published') + ' ' + moment(news.published).fromNow()) : ''"></span>
            </span>
        </span>

        <span class="flex flex-row sm:flex-col justify-center sm:justify-end items-center gap-3">
            <span @click.stop.prevent="emit('bookmark', news)"
                class="action-button hover:bg-green-700 hover:!border-green-700 group"
                ref="bookmark-btn">

                <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-bookmark group-hover:invert-100 dark:invert-100"></span>
            </span>

            <span @click.stop.prevent="emit('hide', news)"
                class="action-button hover:bg-gray-300"
                ref="hide-btn">

                <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-eye-slash dark:invert-100"></span>
            </span>
        </span>
    </span>
</template>