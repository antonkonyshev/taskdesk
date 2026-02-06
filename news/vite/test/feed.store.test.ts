import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useFeedStore } from '../store/feed'
import { updateItem, fetchItems } from 'TaskDesk/js/common/service'
import { Feed } from 'news/types/feed'
import i18n from 'TaskDesk/js/i18n'

describe('feeds store', () => {
    let feed = null
    let afeed = null
    let aafeed = null
    let store = null

    beforeEach(() => {
        vi.mock('TaskDesk/js/common/service.ts')
        feed = {
            id: 2,
            url: "http://localhost:8000/rss2",
            title: "Second testing feed",
        } as Feed
        afeed = {
            id: 1,
            url: "http://localhost:8000/rss1",
            title: "First testing feed",
        } as Feed
        aafeed = {
            id: 3,
            url: "http://localhost:8000/rss3",
            title: "Third testing feed",
        } as Feed
        config.global.plugins = [i18n]
        vi.mocked(updateItem).mockResolvedValue(null)
        vi.mocked(fetchItems).mockResolvedValue([feed, afeed, aafeed])
        setActivePinia(createPinia())
        store = useFeedStore()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('feeds fetching', async () => {
        expect(store.feeds.length).toBe(3)
        expect(store.feeds[0].id).toBe(3)
        expect(store.feeds[0].title).toBe('Third testing feed')
        expect(store.feeds[2].id).toBe(2)
        expect(store.feeds[2].title).toBe('Second testing feed')
        expect(store.feeds[1].id).toBe(1)
        expect(store.feeds[1].title).toBe('First testing feed')
    })

    test('feed creation', async () => {
        await store.loadFeeds()
        const newFeed = { id: 4, title: "Fourth testing feed", url: "http://localhost:8000/rss4" }
        vi.mocked(updateItem).mockResolvedValue(newFeed)
        await store.saveFeed(newFeed)
        expect(store.feeds.length).toBe(4)
        expect(store.feeds[0].id).toBe(4)
        expect(store.feeds[0].title).toBe('Fourth testing feed')
        expect(store.feeds[1].id).toBe(3)
        expect(store.feeds[1].title).toBe('Third testing feed')
    })

    test('feed creation with error', async () => {
        await store.loadFeeds()
        vi.mocked(updateItem).mockRejectedValue(new Error('Internal server error'))
        await store.saveFeed({ title: "Fourth testing feed", url: "http://localhost:8000/rss4" })
        expect(store.feeds.length).toBe(3)
        expect(store.feeds[0].id).toBe(3)
        expect(store.feeds[0].title).toBe('Third testing feed')
        expect(store.feeds[1].id).toBe(1)
        expect(store.feeds[1].title).toBe('First testing feed')
    })

    test('feed removing', async () => {
        await store.loadFeeds()
        await store.removeFeed(store.feeds[1])
        expect(store.feeds.length).toBe(2)
        expect(store.feeds[0].id).toBe(3)
        expect(store.feeds[0].title).toBe('Third testing feed')
        expect(store.feeds[1].id).toBe(2)
        expect(store.feeds[1].title).toBe('Second testing feed')
    })

    test('feed removing with error', async () => {
        await store.loadFeeds()
        vi.mocked(updateItem).mockRejectedValue(new Error("Internal server error"))
        await store.removeFeed(store.feeds[1])
        expect(store.feeds.length).toBe(3)
        expect(store.feeds[0].id).toBe(3)
        expect(store.feeds[0].title).toBe('Third testing feed')
        expect(store.feeds[2].id).toBe(2)
        expect(store.feeds[2].title).toBe('Second testing feed')
        expect(store.feeds[1].id).toBe(1)
        expect(store.feeds[1].title).toBe('First testing feed')
    })

    test('feed editing', async () => {
        await store.loadFeeds()
        const feed = store.feeds[1]
        feed.title = 'Modified testing feed'
        await store.saveFeed(store.feeds[1])
        expect(store.feeds[1].title).toBe('Modified testing feed')
    })

    test('feed saving', async () => {
        await store.loadFeeds()
        const newFeed = { id: 4, title: "Fourth testing feed", url: "http://localhost:8000/rss4" }
        vi.mocked(updateItem).mockResolvedValue(newFeed)
        await store.saveFeed(newFeed)
        expect(store.feeds.length).toBe(4)

        store.feeds[1].title = 'Modified third testing feed'
        vi.mocked(updateItem).mockResolvedValue(null)
        await store.saveFeed(store.feeds[1])
        expect(store.feeds.length).toBe(4)
        expect(store.feeds[1].title).toBe('Modified third testing feed')
    })
})