import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Feed } from 'news/types/feed'

export const useFeedStore = defineStore('feed', () => {
    const feeds = ref<Array<Feed>>([])

    async function loadFeeds() {
        
    }

    async function addFeed(feed: Feed) {
        feeds.value.unshift(feed)
    }

    async function removeFeed(feed: Feed) {
        let idx = feeds.value.findIndex((el) => el.id == feed.id)
        if (idx >= 0) {
            feeds.value.splice(idx, 1)
        }
    }

    return { feeds, loadFeeds, addFeed, removeFeed }
})