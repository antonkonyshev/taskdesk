import { ref } from 'vue'
import { defineStore } from 'pinia'
import { News } from 'news/types/news'

export const useNewsStore = defineStore('news', () => {
    const news = ref<Array<News>>([])

    async function loadNews() {

    }

    return { news, loadNews }
})