import { ref } from 'vue'
import { defineStore } from 'pinia'
import { refreshItem } from 'TaskDesk/js/common/store'
import { News, NewsQuery } from 'news/types/news'
import { prepareNewsSocket } from 'news/services/news.service'


const MIN_NEWS_TO_LOAD_FURTHER = 4
const FETCHING_MORE_NEWS_PERIOD = 300000

export const useNewsStore = defineStore('news', () => {
    const news = ref<Array<News>>([])
    let newsQuery: Readonly<any>

    const refreshNews = (data: News) => {
        if (data.description && data.description.trim()) {
            data.description = new DOMParser().parseFromString(data.description, 'text/html').body.textContent || ""
        }
        refreshItem(data, news, (elem) => elem.id == data.id, true)
    }

    const loadNews = async () => (await prepareNewsSocket()).send(JSON.stringify(
        (newsQuery && newsQuery.request) ? newsQuery: { request: 'unread' }))

    async function markNews(target: News, bookmark = false) {
        try {
            (await prepareNewsSocket()).send(JSON.stringify({
                request: (bookmark ? "bookmark" : "hide"), id: target.id
            }))
            const idx = news.value.findIndex((elem) => elem.id == target.id)
            if (idx >= 0) {
                news.value.splice(idx, 1)
            }
            if (news.value.length <= MIN_NEWS_TO_LOAD_FURTHER) {
                await loadNews()
            }
        } catch(err) {
            console.error(err)
        }
    }

    const fetchingMoreNews = ref<boolean>(false)
    const fetchMoreNews = async () => {
        if (fetchingMoreNews.value) {
            await loadNews()
        } else {
            (await prepareNewsSocket()).send(JSON.stringify({ request: "fetch" }))
            fetchingMoreNews.value = true
            setInterval(() => fetchingMoreNews.value = false,
                        FETCHING_MORE_NEWS_PERIOD)
        }
    }

    const setQuery = (query: NewsQuery) => {
        newsQuery = query
    }

    const dropNews = () => {
        news.value = []
    }

    return {
        news, loadNews, refreshNews, markNews, fetchMoreNews, setQuery,
        dropNews, fetchingMoreNews,
    }
})