<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useNewsStore } from 'news/store/news'
import { News, NewsQuery } from 'news/types/news'
import { onBeforeRouteLeave } from 'vue-router'
import NewsItem from 'news/components/partials/NewsItem.vue'
import Toolbar from 'TaskDesk/js/common/components/Toolbar.vue'
import NewsToolbarActions from 'news/components/partials/NewsToolbarActions.vue'
import { closeNewsSocket } from 'news/services/news.service'

const newsQuery = withDefaults(defineProps<NewsQuery>(), { request: 'unread' } as NewsQuery)
const { t } = useI18n()
const store = useNewsStore()
const newsElements = shallowRef<Array<HTMLAnchorElement>>([])
const isSwiping = ref<string>('')
const unfoldedNews = ref<Array<number>>([])
const { width } = useWindowSize()
const smWidth = 640;

onBeforeRouteLeave((newRoute) => {
    try {
        store.setQuery(newRoute.matched[0].props.default as NewsQuery)
    } catch(err) {}
    store.dropNews()
    store.loadNews()
})

onMounted(() => {
    store.setQuery(newsQuery as NewsQuery)
    store.loadNews()
})

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

const markNewsDelayed = (news: News, bookmark: boolean = false) => {
    setTimeout(() => {
        const idx = unfoldedNews.value.indexOf(news.id);
        if (idx >= 0) {
            unfoldedNews.value.splice(idx, 1)
        }
        store.markNews(news, bookmark)
    }, 400)
}

const onTouchEnd = (news: News, index: number, event, curDirection: 'left'|'right'|null = null) => {
    const elem = newsElements.value[index]
    let distance = elem.clientWidth || 100
    if (!curDirection) {
        isSwiping.value = ''
        distance = Math.abs('changedTouches' in
            event ? event.changedTouches[0].clientX : event.screenX
        ) - Math.abs(swipeStartX.value)
        swipeStartX.value = 0
        setTimeout(() => preventClicks = false, 100)
        curDirection = distance > 0 ? 'right' : 'left'
    }
    if (Math.abs(distance) / elem.clientWidth > 0.25) {
        if (curDirection == 'left') {
            markNewsDelayed(news)
            elem.style.left = '-' + (elem.clientWidth * 2).toString() + 'px'
        } else if (curDirection == 'right') {
            markNewsDelayed(news, true)
            elem.style.left = (elem.clientWidth * 2).toString() + 'px'
        }
    } else {
        elem.style.left = '0'
    }
}

const isFolded = (news: News): boolean => {
    return Boolean(news.description && news.description.length > 128 && unfoldedNews.value.indexOf(news.id) < 0)
}

const handleNewsClick = (news: News, index: number, event: Event) => {
    if (preventClicks) {
        event.preventDefault()
        event.stopPropagation()
        return
    }
    if (width.value < smWidth && isFolded(news)) {
        unfoldedNews.value.push(news.id)
        event.preventDefault()
        event.stopPropagation()
        return
    }
}
</script>

<template>
    <div class="flex flex-col items-center xl:max-w-screen-xl overflow-x-clip xl:[overflow-clip-margin:3px]">
        <div v-for="(news, index) in store.news" :key="news.id"
            class="flex w-full overflow-x-clip xl:[overflow-clip-margin:3px] relative gap-3 my-3 bg-gray-200"
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
                @click="handleNewsClick(news, index, $event)"
                :class="{'transition-all duration-500 ease-linear': !isSwiping}"
                class="relative p-3 size-full shadow-black shadow-xs bg-white dark:bg-gray-800 dark:text-white cursor-pointer">

                <NewsItem :news="news"
                    @hide="onTouchEnd(news, index, $event, 'left')" 
                    @bookmark="onTouchEnd(news, index, $event, 'right')"
                    :is-folded="isFolded(news)" />
            </a>
        </div>

        <button v-if="newsQuery.request == 'unread'" type="button"
            @click="store.fetchMoreNews()"
            class="action-button mt-2 mb-5 !px-4 gap-2 hover:bg-green-700 hover:!border-green-700 hover:text-white font-semibold duration-200 group flex flex-row items-center shadow-black shadow-xs bg-white hover:shadow-md hover:scale-[101%] dark:bg-gray-800 dark:!border-gray-900 dark:text-white cursor-pointer">

            <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-refresh group-hover:invert-100 dark:invert-100"></span>

            <span v-text="store.fetchingMoreNews ? t('message.check_latest_news') : t('message.load_more_news')"></span>
        </button>
        
        <Toolbar>
            <NewsToolbarActions v-if="store.news.length"
                @hide="onTouchEnd(store.news[0], 0, $event, 'left')"
                @bookmark="onTouchEnd(store.news[0], 0, $event, 'right')" />
        </Toolbar>
    </div>
</template>