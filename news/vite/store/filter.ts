import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Filter } from '../types/filter'
import { refreshItem, removeItem } from 'TaskDesk/js/common/store'
import { updateItem, fetchItems } from 'TaskDesk/js/common/service'

export const useFilterStore = defineStore('filter', () => {
    const filters = ref<Array<Filter>>([])

    const endpoint = (filter: Filter | null = null) => "/filter/" + ((filter && filter.id) ? (filter.id + "/") : "")
    const loadFilters = async () => (await fetchItems(endpoint())).forEach(refreshFilter)
    const refreshFilter = (filter: Filter) => refreshItem(filter, filters,
        (elem) => (filter.id && elem.id) ? filter.id == elem.id : (
            filter.entry == elem.entry &&
            filter.part == elem.part && filter.feed_id == elem.feed_id
        ))
    const removeFilter = (filter: Filter) => removeItem(
        filter, filters, endpoint(filter),
        (elem) => (filter.id && elem.id) ? filter.id == elem.id : (
            filter.entry == elem.entry &&
            filter.part == elem.part && filter.feed_id == elem.feed_id
        ))

    async function saveFilter(filter: Filter) {
        if (!filter.id) {
            filter.entry = filter.entry.toLowerCase()
            filters.value.unshift(filter)
        }
        try {
            refreshFilter(await updateItem(filter, 'post', endpoint(filter)))
        } catch(err) {
            if (!filter.id) {
                filters.value.splice(0, 1)
            }
        }
    }
    
    loadFilters()

    return { filters, loadFilters, removeFilter, saveFilter }
})