import { ref } from 'vue'
import { defineStore } from 'pinia'
import { refreshItem } from 'TaskDesk/js/common/store'
import { News, NewsQuery, NewsMeta } from 'news/types/news'
import { prepareNewsSocket } from 'news/services/news.service'


const FETCHING_MORE_NEWS_PERIOD = 300000

export const useNewsStore = defineStore('news', () => {
    const news = ref<Array<News>>([])
    const newsMeta = ref<NewsMeta>({id: "meta", unread: 0, reading: 0} as NewsMeta)
    let newsQuery: Readonly<any>
    let newsListLengthForAutoLoad = 4

    const refreshNews = (data: News) => {
        if (data.description && data.description.trim()) {
            data.description = new DOMParser().parseFromString(data.description, 'text/html').body.textContent || ""
        }
        refreshItem(data, news, (elem) => elem.id == data.id, true)
    }

    const loadNews = async () => (await prepareNewsSocket()).send(JSON.stringify(
        (newsQuery && newsQuery.request) ? newsQuery: { request: 'unread' }))

    const refreshNewsMeta = (data: NewsMeta) => newsMeta.value = data

    async function markNews(target: News, bookmark = false) {
        try {
            (await prepareNewsSocket()).send(JSON.stringify({
                request: (bookmark ? "bookmark" : "hide"), id: target.id
            }))
            const idx = news.value.findIndex((elem) => elem.id == target.id)
            if (idx >= 0) {
                news.value.splice(idx, 1)
                if (newsQuery && (newsQuery.request == "unread" || newsQuery.request == "reading")) {
                    newsMeta.value[newsQuery.request] -= newsMeta.value[newsQuery.request] > 0 ? 1 : 0
                }
            }
            if (news.value.length <= newsListLengthForAutoLoad) {
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
    
    const loadPreferences = () => {
        try {
            const savedPreferences = localStorage.getItem('newsPreferences')
            if (savedPreferences) {
                const prefs = JSON.parse(savedPreferences)
                newsListLengthForAutoLoad = prefs.newsListLengthForAutoLoad || 4
            }
        } catch (e) {}
    }

    loadPreferences()

    return {
        news, loadNews, refreshNews, markNews, fetchMoreNews, setQuery,
        dropNews, fetchingMoreNews, refreshNewsMeta, newsMeta, loadPreferences,
    }
})