import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Feed } from 'news/types/feed'
import { fetchFeeds, updateFeed } from 'news/services/feed.service'

export const useFeedStore = defineStore('feed', () => {
    const feeds = ref<Array<Feed>>([])

    async function loadFeeds() {
        (await fetchFeeds()).forEach(async (feed: Feed) => {
            const idx = feeds.value.findIndex((elem) => elem.id == feed.id)
            if (idx >= 0) {
                feeds.value[idx] = feed
            } else {
                feeds.value.unshift(feed)
            }
        })
    }

    async function addFeed(feed: Feed) {
        feeds.value.unshift(feed)
        try {
            feed.id = await updateFeed(feed, 'post')
        } catch(err) {
            feeds.value.splice(0, 1)
        }
    }

    async function removeFeed(feed: Feed) {
        if (!feed.id) {
            return
        }
        const idx = feeds.value.findIndex((elem) => elem.id == feed.id)
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

    async function editFeed(feed: Feed) {
        try {
            await updateFeed(feed, 'patch')
        } catch(err) {}
    }

    return { feeds, loadFeeds, addFeed, editFeed, removeFeed }
})