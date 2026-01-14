import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Filter } from 'news/types/filter'

export const useFilterStore = defineStore('filter', () => {
    const filters = ref<Array<Filter>>([])

    async function loadFilters() {
        
    }

    return { filters, loadFilters }
})