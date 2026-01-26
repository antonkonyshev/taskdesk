import { config, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useFeedStore } from 'news/store/feed'
import { fetchItems, updateItem } from 'TaskDesk/js/common/service'
import { Feed } from 'news/types/feed'
import i18n from 'TaskDesk/js/i18n'
import FeedList from 'news/components/list/FeedList.vue'
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'
import FeedForm from 'news/components/form/FeedForm.vue'

describe('feeds related components rendering', () => {
    let feed = null
    let afeed = null
    let aafeed = null
    let store = null

    beforeEach(() => {
        vi.mock('TaskDesk/js/common/service.ts')
        setActivePinia(createPinia())
        config.global.plugins = [i18n]
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
        vi.mocked(fetchItems).mockResolvedValue([feed, afeed, aafeed])
        store = useFeedStore()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('feeds list component', async () => {
        const wrapper = mount(FeedList)
        await store.loadFeeds()
        expect(wrapper.text()).toContain("First testing feed")
        expect(wrapper.text()).toContain("http://localhost:8000/rss1")
        expect(wrapper.text()).toContain("Second testing feed")
        expect(wrapper.text()).toContain("http://localhost:8000/rss2")
        expect(wrapper.text()).toContain("Third testing feed")
        expect(wrapper.text()).toContain("http://localhost:8000/rss3")
    })

    test('feed creation form', async () => {
        let cancelled = false
        let submitted = false
        let feed = { title: '', url: '' }
        const wrapper = mount(FeedForm, {
            props: {
                modelValue: feed,
                onCancel: () => { cancelled = true },
                onSubmit: () => { submitted = true },
            },
        })

        expect(wrapper.html()).toContain("submit")
        expect(wrapper.html()).toContain("id_title")
        expect(wrapper.html()).toContain("id_url")
        await wrapper.find({ ref: "cancel-btn" }).trigger('click')
        expect(cancelled).toBeTruthy()
        await wrapper.find("#id_title").setValue("Testing title")
        await wrapper.find("#id_url").setValue("http://localhost:8000/rss")
        await wrapper.find({ ref: "submit-btn" }).trigger('click')
        expect(submitted).toBeTruthy()
        expect(feed.title).toBe("Testing title")
        expect(feed.url).toBe("http://localhost:8000/rss")
    })

    test('feed editing form', async () => {
        await store.loadFeeds()
        let cancelled = false
        let submitted = false
        const id = store.feeds[0].id
        const wrapper = mount(FeedForm, {
            props: {
                modelValue: store.feeds[0],
                onCancel: () => { cancelled = true },
                onSubmit: () => { submitted = true },
            },
        })

        expect(wrapper.html()).toContain("submit")
        expect(wrapper.html()).toContain("id_title")
        expect(wrapper.html()).toContain("id_url")
        await wrapper.find({ ref: "cancel-btn" }).trigger('click')
        expect(cancelled).toBeTruthy()
        await wrapper.find("#id_title").setValue("Testing title")
        await wrapper.find("#id_url").setValue("http://localhost:8000/rss")
        await wrapper.find({ ref: "submit-btn" }).trigger('click')
        expect(submitted).toBeTruthy()
        expect(store.feeds[0].title).toBe("Testing title")
        expect(store.feeds[0].url).toBe("http://localhost:8000/rss")
        expect(store.feeds[0].id).toBe(id)
    })

    test('feed creation button component', async () => {
        let createFeedCalled = false
        const wrapper = mount(AddButton, { propsData: {
            addItem: () => { createFeedCalled = true }
        }})
        expect(wrapper.html()).toContain("button")
        await wrapper.find({ ref: "add-btn" }).trigger('click')
        expect(createFeedCalled).toBeTruthy()
    })

    test('feed removing button component', async () => {
        vi.mocked(updateItem).mockResolvedValue(null)
        const wrapper = mount(FeedList)
        await store.loadFeeds()
        await wrapper.get({ ref: 'delete-btn' }).trigger('click')
        expect(store.feeds.length).toBe(2)
        expect(wrapper.text()).toContain("Second testing feed")
        expect(wrapper.text()).toContain("http://localhost:8000/rss2")
        expect(wrapper.text()).toContain("First testing feed")
        expect(wrapper.text()).toContain("http://localhost:8000/rss1")
        expect(wrapper.text()).not.toContain("Third testing feed")
        expect(wrapper.text()).not.toContain("http://localhost:8000/rss3")
    })
})