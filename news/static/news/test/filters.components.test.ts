import { config, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useFilterStore } from 'news/store/filter'
import { Filter } from 'news/types/filter'
import i18n from 'TaskDesk/js/i18n'
import FilterList from 'news/components/list/FilterList.vue'
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'

describe('filters related components rendering', () => {
    let filter = null
    let afilter = null
    let aafilter = null
    let store = null

    beforeEach(() => {
        setActivePinia(createPinia())
        config.global.plugins = [i18n]
        filter = {
            id: 2,
            entry: "second",
            part: "full",
            feed: 2
        } as Filter
        afilter = {
            id: 1,
            entry: "first",
            part: "start",
        } as Filter
        aafilter = {
            id: 3,
            entry: "third",
            part: "end",
            feed: 3
        } as Filter
        store = useFilterStore()
        store.filters = [filter, afilter, aafilter]
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('filter form component', () => {
        expect(false).toBeTruthy()
    })

    test('filters list component', () => {
        const wrapper = mount(FilterList)
        expect(wrapper.text()).toContain("first")
        expect(wrapper.text()).toContain("second")
        expect(wrapper.text()).toContain("third")
    })

    test('filters creation button component', () => {
        let createFilterCalled = false
        const wrapper = mount(AddButton, { propsData: {
            addItem: () => { createFilterCalled = true }
        }})
        expect(wrapper.html()).toContain("button")
        wrapper.find({ ref: "add-btn" }).trigger('click')
        expect(createFilterCalled).toBeTruthy()
    })

    test('filters removing button component', () => {
        expect(false).toBeTruthy()
    })
})