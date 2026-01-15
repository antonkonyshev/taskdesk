import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Filter } from 'news/types/filter'
import { fetchFilters, updateFilter } from 'news/services/filter.service'

export const useFilterStore = defineStore('filter', () => {
    const filters = ref<Array<Filter>>([])

    async function loadFilters() {
        (await fetchFilters()).forEach(async (filter: Filter) => {
            const idx = filters.value.findIndex((elem) => elem.id == filter.id)
            if (idx >= 0) {
                filters.value[idx] = filter
            } else {
                filters.value.unshift(filter)
            }
        })
    }

    async function addFilter(filter: Filter) {
        filters.value.unshift(filter)
        try {
            filter.id = await updateFilter(filter, 'post')
        } catch(err) {
            filters.value.splice(0, 1)
        }
    }

    async function removeFilter(filter: Filter) {
        if (!filter.id) {
            return
        }
        const idx = filters.value.findIndex((elem) => elem.id == filter.id)
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

    async function editFilter(filter: Filter) {
        try {
            await updateFilter(filter, 'patch')
        } catch(err) {}
    }

    return { filters, loadFilters, addFilter, removeFilter, editFilter }
})