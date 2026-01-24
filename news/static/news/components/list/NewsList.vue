<script setup lang="ts">
import { ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'
import { useNewsStore } from 'news/store/news'
import { useFeedStore } from 'news/store/feed'
import { News, NewsQuery } from 'news/types/news'


const newsQuery = withDefaults(defineProps<NewsQuery>(), { request: 'unread' } as NewsQuery)
const { t } = useI18n()
const store = useNewsStore()
store.setQuery(newsQuery as NewsQuery)
const feedStore = useFeedStore()
const newsElements = ref<Array<HTMLAnchorElement>>([])
const isSwiping = ref<string>('')

onBeforeRouteLeave((nextPath, prevPath) => {
    store.dropNews()
})

const stripHtmlTags = (text: string) => {
    const html = new DOMParser().parseFromString(text, 'text/html')
    return html.body.textContent || ""
}

const newsFeedTitle = (id: number) => {
    const feed = feedStore.feeds.find((elem) => elem.id == id)
    return feed ? (feed.title || feed.url) : ''
}

const swipeStartX = ref<number>(0)
let preventClicks = false
const onTouchStart = (news: News, index: number, event) => {
    const screenX = 'changedTouches' in event ? event.changedTouches[0].clientX : event.screenX
    swipeStartX.value = screenX
}

const onTouchMove = (news: News, index: number, event) => {
    if (swipeStartX.value <= 0) {
        return
    }
    const screenX = 'changedTouches' in event ? event.changedTouches[0].clientX : event.screenX
    const distance = Math.abs(screenX) - Math.abs(swipeStartX.value)
    const direction = distance > 0 ? 'right' : 'left'
    if (!preventClicks && Math.abs(distance) > 20) {
        preventClicks = true
    }
    if (isSwiping.value != direction) {
        isSwiping.value = direction
    }
    if (Math.abs(distance) > 20) {
        const elem = newsElements.value[index]
        elem.style.left = distance.toString() + 'px'
    }
}

const onTouchEnd = (news: News, index: number, event, direction = null) => {
    const elem = newsElements.value[index]
    let distance = elem.clientWidth || 100
    if (!direction) {
        isSwiping.value = ''
        distance = Math.abs('changedTouches' in
            event ? event.changedTouches[0].clientX : event.screenX
        ) - Math.abs(swipeStartX.value)
        swipeStartX.value = 0
        setTimeout(() => preventClicks = false, 100)
        direction = distance > 0 ? 'right' : 'left'
    }
    if (Math.abs(distance) / elem.clientWidth > 0.25) {
        if (direction == 'left') {
            setTimeout(() => store.markNews(news), 400)
            elem.style.left = '-' + (elem.clientWidth * 2).toString() + 'px'
        } else if (direction == 'right') {
            setTimeout(() => store.markNews(news, true), 400)
            elem.style.left = (elem.clientWidth * 2).toString() + 'px'
        }
    } else {
        elem.style.left = '0'
    }
}

const preventClickOnSwipe = (event: Event) => {
    if (preventClicks) {
        event.preventDefault()
        event.stopPropagation()
    }
}

store.loadNews()
if (!feedStore.feeds.length) {
    feedStore.loadFeeds()
}
</script>

<template>
    <div class="flex flex-col items-center xl:max-w-screen-xl overflow-x-clip xl:[overflow-clip-margin:3px]">
        <div v-for="(news, index) in store.news" :key="news.id"
            class="flex w-full overflow-x-clip xl:[overflow-clip-margin:3px] relative gap-3 my-3 bg-gray-200 wrap-break-word"
            :class="{'bg-green-700': isSwiping == 'right'}">

            <span class="absolute opacity-0 top-0 right-5 w-[50px] h-[100%] duration-500 bg-no-repeat bg-center bg-contain svg-eye-slash"
                :class="{'opacity-100 !duration-[0ms]': isSwiping == 'left', }"></span>
            <span class="absolute opacity-0 top-0 left-5 w-[50px] h-[100%] duration-500 bg-no-repeat bg-center bg-contain svg-bookmark invert-100"
                :class="{'opacity-100 !duration-[0ms]': isSwiping == 'right'}"></span>

            <a :href="news.link" target="_blank"
                ref="newsElements"
                @touchstart="onTouchStart(news, index, $event)"
                @touchend="onTouchEnd(news, index, $event)"
                @touchmove="onTouchMove(news, index, $event)"
                @mousedown.prevent="onTouchStart(news, index, $event)"
                @mousemove.prevent="onTouchMove(news, index, $event)"
                @mouseup.prevent="onTouchEnd(news, index, $event)"
                @click="preventClickOnSwipe($event)"
                :class="{'transition-all duration-500 ease-linear': !isSwiping}"
                class="relative p-3 size-full shadow-black shadow-xs bg-white dark:bg-gray-800 dark:text-white cursor-pointer">

                <span class="flex flex-col gap-3 md:gap-4 lg:gap-5 sm:flex-row">
                    <span class="flex flex-col gap-1 sm:gap-2 flex-1">
                        <span class="font-semibold flex flex-row justify-between items-start gap-2">
                            <span v-text="news.title" class="text-lg"></span>
                        </span>
                        
                        <span v-html="stripHtmlTags(news.description)" class="text-md flex-1"></span>

                        <span class="hidden sm:flex sm:flex-row">
                            <span v-text="newsFeedTitle(news.feed)" class="flex-1"></span>

                            <span
                                v-text="news.published ? (t('message.published') + ' ' + moment(news.published).fromNow()) : ''"></span>
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
                        <span @click.stop.prevent="onTouchEnd(news, index, $event, 'right')"
                            class="action-button hover:bg-green-700 hover:!border-green-700 group"
                            ref="bookmark-btn">

                            <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-bookmark group-hover:invert-100 dark:invert-100"></span>
                        </span>

                        <span @click.stop.prevent="onTouchEnd(news, index, $event, 'left')"
                            class="action-button hover:bg-gray-300"
                            ref="hide-btn">

                            <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-eye-slash dark:invert-100"></span>
                        </span>
                    </span>
                </span>
            </a>
        </div>

        <button type="button" @click="store.fetchMoreNews()"
            class="action-button mt-2 mb-5 !px-4 gap-2 hover:bg-green-700 hover:!border-green-700 hover:text-white font-semibold duration-200 group flex flex-row items-center shadow-black shadow-xs bg-white hover:shadow-md hover:scale-[101%] dark:bg-gray-800 dark:!border-gray-900 dark:text-white cursor-pointer">

            <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-refresh group-hover:invert-100 dark:invert-100"></span>

            <span v-text="t('message.load_more_news')"></span>
        </button>
    </div>
</template>