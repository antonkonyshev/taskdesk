import { config, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useFilterStore } from 'news/store/filter'
import { Filter } from 'news/types/filter'
import i18n from 'TaskDesk/js/i18n'
import FilterList from 'news/components/list/FilterList.vue'
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'
import FilterForm from 'news/components/form/FilterForm.vue'
import { updateItem, fetchItems } from 'TaskDesk/js/common/service'

describe('filters related components rendering', () => {
    let filter = null
    let afilter = null
    let aafilter = null
    let store = null

    beforeEach(() => {
        vi.mock('TaskDesk/js/common/service.ts')
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
        vi.mocked(fetchItems).mockResolvedValue([filter, afilter, aafilter])
        vi.mocked(updateItem).mockResolvedValue(null)
        setActivePinia(createPinia())
        store = useFilterStore()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('filters list component', async () => {
        await store.loadFilters()
        const wrapper = mount(FilterList)
        expect(wrapper.text()).toContain("first")
        expect(wrapper.text()).toContain("second")
        expect(wrapper.text()).toContain("third")
    })

    test('filters creation button component', async () => {
        let createFilterCalled = false
        const wrapper = mount(AddButton, { propsData: {
            addItem: () => { createFilterCalled = true }
        }})
        expect(wrapper.html()).toContain("button")
        await wrapper.find({ ref: "add-btn" }).trigger('click')
        expect(createFilterCalled).toBeTruthy()
    })

    test('filter creation form', async () => {
        let cancelled = false
        let submitted = false
        let filter = { entry: '', part: 'start' }
        const wrapper = mount(FilterForm, {
            props: {
                modelValue: filter,
                onCancel: () => { cancelled = true },
                onSubmit: () => { submitted = true },
            },
        })

        expect(wrapper.html()).toContain("submit")
        expect(wrapper.html()).toContain("id_entry")
        expect(wrapper.html()).toContain("id_part")
        await wrapper.find({ ref: "cancel-btn" }).trigger('click')
        expect(cancelled).toBeTruthy()
        await wrapper.find("#id_entry").setValue("testing")
        await wrapper.find("#id_part").setValue("full")
        await wrapper.find({ ref: "submit-btn" }).trigger('click')
        expect(submitted).toBeTruthy()
        expect(filter.entry).toBe("testing")
        expect(filter.part).toBe("full")
    })

    test('filter editing form', async () => {
        await store.loadFilters()
        let cancelled = false
        let submitted = false
        const id = store.filters[0].id
        const wrapper = mount(FilterForm, {
            props: {
                modelValue: store.filters[0],
                onCancel: () => { cancelled = true },
                onSubmit: () => { submitted = true },
            },
        })

        expect(wrapper.html()).toContain("submit")
        expect(wrapper.html()).toContain("id_entry")
        expect(wrapper.html()).toContain("id_part")
        await wrapper.find({ ref: "cancel-btn" }).trigger('click')
        expect(cancelled).toBeTruthy()
        await wrapper.find("#id_entry").setValue("testing")
        await wrapper.find("#id_part").setValue("end")
        await wrapper.find({ ref: "submit-btn" }).trigger('click')
        expect(submitted).toBeTruthy()
        expect(store.filters[0].entry).toBe("testing")
        expect(store.filters[0].part).toBe("end")
        expect(store.filters[0].id).toBe(id)
    })

    test('filter removing button component', async () => {
        vi.mock('news/services/filter.service.ts')
        vi.mocked(updateItem).mockResolvedValue(null)
        const wrapper = mount(FilterList)
        await store.loadFilters()
        await wrapper.get({ ref: 'delete-btn' }).trigger('click')
        expect(store.filters.length).toBe(2)
        expect(wrapper.text()).toContain("second")
        expect(wrapper.text()).toContain("first")
        expect(wrapper.text()).not.toContain("third")
    })
})