import { ref } from 'vue'
import { defineStore } from 'pinia'
import { News } from 'news/types/news'
import { prepareNewsSocket } from 'news/services/news.service'

export const useNewsStore = defineStore('news', () => {
    const news = ref<Array<News>>([])

    async function loadNews() {
        try {
            (await prepareNewsSocket()).send(JSON.stringify({ request: "list" }))
        } catch(err) {
            console.error(err)
        }
    }

    function updateNews(data: Array<News>) {
        data.sort((elema, elemb) => { return elema.published.getDate() - elemb.published.getDate() }).forEach((current) => {
            const idx = news.value.findIndex((elem) => elem.id == current.id)
            if (idx >= 0) {
                news.value.splice(idx, 1, current)
            } else {
                news.value.unshift(current)
            }
        })
    }

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

    return { news, loadNews, updateNews, markNews }
})