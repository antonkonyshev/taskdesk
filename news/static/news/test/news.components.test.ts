import { config, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useNewsStore } from 'news/store/news'
import { News } from 'news/types/news'
import i18n from 'TaskDesk/js/i18n'
import { updateItem, fetchItems } from 'TaskDesk/js/common/service'
import { prepareNewsSocket, closeNewsSocket } from 'news/services/news.service'
import { router } from 'news/navigation/routing'
import NewsNavigation from 'news/components/navigation/NewsNavigation.vue'
import NewsList from 'news/components/list/NewsList.vue'

describe('news related components rendering', () => {
    let news = null
    let anews = null
    let aanews = null
    let store = null
    let lastRequest = null
    let socket = { send: (data) => lastRequest = data }

    beforeEach(() => {
        vi.useFakeTimers()
        vi.mock('news/services/news.service')
        vi.mocked(prepareNewsSocket).mockResolvedValue(socket)
        vi.mocked(closeNewsSocket).mockResolvedValue()
        vi.mock('TaskDesk/js/common/service')
        vi.mocked(updateItem).mockResolvedValue(null)
        vi.mocked(fetchItems).mockResolvedValue([])
        setActivePinia(createPinia())
        config.global.plugins = [i18n, router]
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
            author: "John Doe",
            enclosure_url: "http://localhost:8000/img/test.png",
            enclosure_type: "image/png",
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
        let newsStore = useNewsStore()
        newsStore.news = [news, anews, aanews]
        store = useNewsStore()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('news navigation component', () => {
        const wrapper = mount(NewsNavigation)
        expect(wrapper.text()).toContain("Feeds")
        expect(wrapper.html()).toContain("/news/feeds")
        expect(wrapper.text()).toContain("Filters")
        expect(wrapper.html()).toContain("/news/filters")
        expect(wrapper.text()).toContain("Unread")
        expect(wrapper.text()).toContain("Reading")
        expect(wrapper.html()).toContain("/news/reading")
    })

    test('news list component', () => {
        const wrapper = mount(NewsList, {props: {request: "unread"}})
        expect(wrapper.text()).toContain("First testing news")
        expect(wrapper.html()).toContain("http://localhost:8000/news/")
        expect(wrapper.text()).toContain("Second testing news")
        expect(wrapper.text()).toContain("Second testing news description")
        expect(wrapper.html()).toContain("http://localhost:8000/img/test.png")
        expect(wrapper.text()).toContain("Third testing news")
        expect(wrapper.text()).toContain("Third testing news description")
        expect(wrapper.html()).toContain("http://localhost:8000/news/reading")
    })

    test('news bookmarking', async () => {
        const wrapper = mount(NewsList, {props: {request: "unread"}})
        await wrapper.get({ ref: 'bookmark-btn' }).trigger('click')
        await vi.runAllTimersAsync()
        expect(store.news.length).toBe(2)
        expect(wrapper.text()).not.toContain("Second testing news")
        expect(wrapper.text()).toContain("First testing news")
        expect(wrapper.text()).toContain("Third testing news")

        await wrapper.get({ ref: 'hide-btn' }).trigger('click')
        await vi.runAllTimersAsync()
        expect(store.news.length).toBe(1)
        expect(wrapper.text()).not.toContain("Second testing news")
        expect(wrapper.text()).not.toContain("First testing news")
        expect(wrapper.text()).toContain("Third testing news")
    })
})