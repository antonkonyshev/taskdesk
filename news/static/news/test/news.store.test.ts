import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useNewsStore } from 'news/store/news'
import { News } from 'news/types/news'
import { prepareNewsSocket, closeNewsSocket } from 'news/services/news.service'
import i18n from 'TaskDesk/js/i18n'

describe('news store', () => {
    let news = null
    let anews = null
    let aanews = null
    let store = null

    beforeEach(() => {
        vi.mock('news/service/news.service.ts')
        news = {
            id: 2,
            guid: "something",
            title: "Second testing news",
            description: "Second testing news description",
            link: "http://localhost:8000/news/",
            published: new Date(new Date().getDate() - 1000),
            updated: null,
        } as News
        anews = {
            id: 1,
            guid: "somethingelse",
            title: "First testing news",
            published: new Date(new Date().getDate() - 2000),
            updated: new Date(),
            author: "John Doe",
            enclosure: "http://localhost:8000/img/test.png",
            feed: 1,
        } as News
        aanews = {
            id: 3,
            title: "Third testing news",
            description: "Third testing news description",
            link: "http://localhost:8000/news/reading",
            published: new Date(),
            author: "John Doe",
            feed: 2,
        } as News
        vi.mocked(prepareNewsSocket).mockResolvedValue({})
        vi.mocked(closeNewsSocket).mockResolvedValue()
        setActivePinia(createPinia())
        store = useNewsStore()
        config.global.plugins = [i18n]
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('news loading from backend', async () => {
        await store.loadNews()
        expect(store.news.length).toBe(3)
        expect(store.news[0].id).toBe(3)
        expect(store.news[0].title).toBe('Third testing news')
        expect(store.news[1].id).toBe(2)
        expect(store.news[1].title).toBe('Second testing news')
        expect(store.news[2].id).toBe(1)
        expect(store.news[2].title).toBe('First testing news')
    })

    test('news updating from backend', async () => {
        let aaanews = {
            id: 4,
            guid: "somethinggg",
            title: "Fourth testing news",
            description: "Fourth testing news description",
            link: "http://localhost:8000/news/fourth",
            published: new Date(new Date().getDate()),
        } as News
        await store.loadNews()
        expect(store.news.length).toBe(4)
        expect(store.news[0].id).toBe(4)
        expect(store.news[0].title).toBe('Fourth testing news')
        expect(store.news[0].id).toBe(3)
        expect(store.news[0].title).toBe('Third testing news')
        expect(store.news[1].id).toBe(2)
        expect(store.news[1].title).toBe('Second testing news')
        expect(store.news[2].id).toBe(1)
        expect(store.news[2].title).toBe('First testing news')
    })

    test('news hiding', async () => {
        expect(false).toBeTruthy()
    })

    test('news bookmarking', async () => {
        expect(false).toBeTruthy()
    })
})