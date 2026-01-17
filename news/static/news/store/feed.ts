import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Feed } from 'news/types/feed'
import { refreshItem, removeItem, saveItem } from 'TaskDesk/js/common/store'
import { fetchItems } from 'TaskDesk/js/common/service'

export const useFeedStore = defineStore('feed', () => {
    const feeds = ref<Array<Feed>>([])

    const endpoint = (feed: Feed | null = null) => "/feed/" + ((feed && feed.id) ? (feed.id + "/") : "")
    const refreshFeed = (feed: Feed) => refreshItem(feed, feeds,
        (elem: Feed) => (feed.id && elem.id) ? feed.id == elem.id : feed.url == elem.url)
    const loadFeeds = async () => (await fetchItems(endpoint())).forEach(refreshFeed)
    const removeFeed = (feed: Feed) => removeItem(feed, feeds, endpoint(feed),
        (elem: Feed) => (feed.id && elem.id) ? elem.id == feed.id : feed.url == elem.url)
    const saveFeed = (feed: Feed) => saveItem(feed, feeds, endpoint(feed), 
        (elem: Feed) => (feed.id && elem.id) ? elem.id == feed.id : feed.url == elem.url)

    return { feeds, loadFeeds, removeFeed, saveFeed }
})