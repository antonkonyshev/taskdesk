import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Feed } from 'news/types/feed'
import { fetchFeeds, updateFeed } from 'news/services/feed.service'

export const useFeedStore = defineStore('feed', () => {
    const feeds = ref<Array<Feed>>([])

    function refreshFeed(feed: Feed) {
        if (!feed) {
            return 
        }
        const idx = feeds.value.findIndex((elem) => (feed.id && elem.id) ? feed.id == elem.id : feed.url == elem.url)
        if (idx >= 0) {
            feeds.value.splice(idx, 1, feed)
        } else {
            feeds.value.unshift(feed)
        }
    }

    const loadFeeds = async () => (await fetchFeeds()).forEach(refreshFeed)

    async function saveFeed(feed: Feed) {
        if (!feed.id) {
            feeds.value.unshift(feed)
        }
        try {
            refreshFeed(await updateFeed(feed, 'post'))
        } catch(err) {
            if (!feed.id) {
                feeds.value.splice(0, 1)
            }
        }
    }

    async function removeFeed(feed: Feed) {
        const idx = feeds.value.findIndex((elem) => (feed.id && elem.id) ? elem.id == feed.id : feed.url == elem.url)
        if (idx >= 0) {
            feeds.value.splice(idx, 1)
        }
        if (feed.id) {
            try {
                await updateFeed(feed, 'delete')
            } catch(err) {
                feeds.value.splice(idx, 0, feed)
            }
        }
    }

    return { feeds, loadFeeds, removeFeed, saveFeed }
})