import { ref } from 'vue'
import { defineStore } from 'pinia'
import { refreshItem } from 'TaskDesk/js/common/store'
import { News } from 'news/types/news'
import { prepareNewsSocket } from 'news/services/news.service'


const MIN_NEWS_TO_LOAD_FURTHER = 4
const FETCHING_MORE_NEWS_PERIOD = 300000

export const useNewsStore = defineStore('news', () => {
    const news = ref<Array<News>>([])

    const refreshNews = (data: News) => refreshItem(
        data, news, (elem) => elem.id == data.id, true)
    const loadNews = async () => (await prepareNewsSocket()).send(
        JSON.stringify({ request: "unread" }))

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

    let fetchingMoreNews = false
    const fetchMoreNews = async () => {
        if (fetchingMoreNews) {
            await loadNews()
        } else {
            (await prepareNewsSocket()).send(JSON.stringify({ request: "fetch" }))
            fetchingMoreNews = true
            setInterval(() => fetchingMoreNews = false, FETCHING_MORE_NEWS_PERIOD)
        }
    }

    return { news, loadNews, refreshNews, markNews, fetchMoreNews }
})