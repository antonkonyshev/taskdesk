import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useFilterStore } from '../store/filter'
import { fetchItems, updateItem } from 'TaskDesk/js/common/service'
import { Filter } from 'news/types/filter'
import i18n from 'TaskDesk/js/i18n'

describe('filters store', () => {
    let filter = null
    let afilter = null
    let aafilter = null
    let store = null

    beforeEach(() => {
        vi.mock('TaskDesk/js/common/service.ts')
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
        vi.mocked(updateItem).mockResolvedValue(null)
        vi.mocked(fetchItems).mockResolvedValue([filter, afilter, aafilter])
        setActivePinia(createPinia())
        store = useFilterStore()
        config.global.plugins = [i18n]
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('filters fetching', async () => {
        expect(store.filters.length).toBe(0)
        await store.loadFilters()
        expect(store.filters.length).toBe(3)
        expect(store.filters[0].id).toBe(3)
        expect(store.filters[0].entry).toBe('third')
        expect(store.filters[2].id).toBe(2)
        expect(store.filters[2].entry).toBe('second')
        expect(store.filters[1].id).toBe(1)
        expect(store.filters[1].entry).toBe('first')
    })

    test('filter creation', async () => {
        await store.loadFilters()
        const nfilter = {id: 4, entry: "fourth", part: "full"} as Filter
        vi.mocked(updateItem).mockResolvedValue(nfilter)
        await store.saveFilter(nfilter)
        expect(store.filters.length).toBe(4)
        expect(store.filters[0].id).toBe(4)
        expect(store.filters[0].entry).toBe('fourth')
        expect(store.filters[1].id).toBe(3)
        expect(store.filters[1].entry).toBe('third')
    })

    test('filter creation with error', async () => {
        await store.loadFilters()
        const nfilter = {entry: "test", part: "full"} as Filter
        vi.mocked(updateItem).mockRejectedValue(new Error('Internal server error'))
        await store.saveFilter(nfilter)
        expect(store.filters.length).toBe(3)
        expect(store.filters[0].id).toBe(3)
        expect(store.filters[0].entry).toBe('third')
    })

    test('filter removing', async () => {
        await store.loadFilters()
        await store.removeFilter(store.filters[1])
        expect(store.filters.length).toBe(2)
        expect(store.filters[0].id).toBe(3)
        expect(store.filters[0].entry).toBe('third')
        expect(store.filters[1].id).toBe(2)
        expect(store.filters[1].entry).toBe('second')
    })

    test('filter removing with error', async () => {
        await store.loadFilters()
        vi.mocked(updateItem).mockRejectedValue(new Error('Internal server error'))
        await store.removeFilter(store.filters[1])
        expect(store.filters.length).toBe(3)
        expect(store.filters[0].id).toBe(3)
        expect(store.filters[0].entry).toBe('third')
        expect(store.filters[2].id).toBe(2)
        expect(store.filters[2].entry).toBe('second')
        expect(store.filters[1].id).toBe(1)
        expect(store.filters[1].entry).toBe('first')
    })

    test('filter editing', async () => {
        await store.loadFilters()
        store.filters[1].entry = 'testing'
        await store.saveFilter(store.filters[1])
        expect(store.filters[1].entry).toBe('testing')
    })

    test('filter saving', async () => {
        await store.loadFilters()
        const newFilter = { id: 4, entry: "fourth", part: "full" }
        vi.mocked(updateItem).mockResolvedValue(newFilter)
        await store.saveFilter(newFilter)
        expect(store.filters.length).toBe(4)

        store.filters[1].title = 'three'
        vi.mocked(updateItem).mockResolvedValue(null)
        await store.saveFilter(store.filters[1])
        expect(store.filters.length).toBe(4)
        expect(store.filters[1].title).toBe('three')
    })
})