import { config, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useFeedStore } from 'news/store/feed'
import { Feed } from 'news/types/feed'
import i18n from 'TaskDesk/js/i18n'
import FeedList from 'news/components/FeedList.vue'
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'

describe('feeds related components rendering', () => {
    let feed = null
    let afeed = null
    let aafeed = null
    let store = null

    beforeEach(() => {
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
        store = useFeedStore()
        store.feeds = [feed, afeed, aafeed]
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('feeds list component', () => {
        const wrapper = mount(FeedList)
        expect(wrapper.text()).toContain("First testing feed")
        expect(wrapper.text()).toContain("http://localhost:8000/rss1")
        expect(wrapper.text()).toContain("Second testing feed")
        expect(wrapper.text()).toContain("http://localhost:8000/rss2")
        expect(wrapper.text()).toContain("Third testing feed")
        expect(wrapper.text()).toContain("http://localhost:8000/rss3")
    })

    test('feed creation form', () => {
        expect(false).toBeTruthy()
    })

    test('feed creation button component', () => {
        let createFeedCalled = false
        const wrapper = mount(AddButton, { propsData: {
            addItem: () => { createFeedCalled = true }
        }})
        expect(wrapper.html()).toContain("button")
        wrapper.find({ ref: "add-btn" }).trigger('click')
        expect(createFeedCalled).toBeTruthy()
    })

    test("feed removing button component', () => {
        expect(false).toBeTruthy()
    })
})