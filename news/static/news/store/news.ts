import { ref } from 'vue'
import { defineStore } from 'pinia'
import { refreshItem } from 'TaskDesk/js/common/store'
import { News } from 'news/types/news'
import { prepareNewsSocket } from 'news/services/news.service'

export const useNewsStore = defineStore('news', () => {
    const news = ref<Array<News>>([])

    const refreshNews = (data: News) => refreshItem(
        data, news, (elem) => elem.id == data.id, true)
    const loadNews = async () => (await prepareNewsSocket()).send(
        JSON.stringify({ request: "list" }))

    async function markNews(target: News, bookmark = false) {
        try {
            (await prepareNewsSocket()).send(JSON.stringify({
                request: (bookmark ? "bookmark" : "hide"), id: target.id
            }))
            const idx = news.value.findIndex((elem) => elem.id == target.id)
            if (idx >= 0) {
                news.value.splice(idx, 1)
            }
        } catch(err) {
            console.error(err)
        }
    }

    return { news, loadNews, refreshNews, markNews }
})