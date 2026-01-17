import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Filter } from 'news/types/filter'
import { fetchFilters, updateFilter } from 'news/services/filter.service'

export const useFilterStore = defineStore('filter', () => {
    const filters = ref<Array<Filter>>([])

    function refreshFilter(filter: Filter) {
        if (!filter) {
            return 
        }
        const idx = filters.value.findIndex(
            (elem) => (filter.id && elem.id) ? filter.id == elem.id : (
                filter.entry == elem.entry &&
                filter.part == elem.part && filter.feed_id == elem.feed_id
            ))
        if (idx >= 0) {
            filters.value.splice(idx, 1, filter)
        } else {
            filters.value.unshift(filter)
        }
    }

    const loadFilters = async () => (await fetchFilters()).forEach(refreshFilter)

    async function saveFilter(filter: Filter) {
        if (!filter.id) {
            filter.entry = filter.entry.toLowerCase()
            filters.value.unshift(filter)
        }
        try {
            refreshFilter(await updateFilter(filter, 'post'))
        } catch(err) {
            if (!filter.id) {
                filters.value.splice(0, 1)
            }
        }
    }

    async function removeFilter(filter: Filter) {
        const idx = filters.value.findIndex(
            (elem) => (filter.id && elem.id) ? filter.id == elem.id : (
                filter.entry == elem.entry && filter.part == elem.part &&
                filter.feed_id == elem.feed_id
            ))
        if (idx >= 0) {
            filters.value.splice(idx, 1)
        }
        if (filter.id) {
            try {
                await updateFilter(filter, 'delete')
            } catch(err) {
                filters.value.splice(idx, 0, filter)
            }
        }
    }

    return { filters, loadFilters, removeFilter, saveFilter }
})