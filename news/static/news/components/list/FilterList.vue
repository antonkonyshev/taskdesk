<script setup lang="ts">
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'
import { useFilterStore } from 'news/store/filter'
import { Filter } from 'news/types/filter'
import FilterForm from 'news/components/form/FilterForm.vue'

const mdWidth = 768;
const { width } = useWindowSize()
const store = useFilterStore()
const selectedFilter = ref<Filter>(null)

async function createFilter() {
    selectedFilter.value = { entry: "", part: "start" } as Filter
}

async function saveFilter() {
    const currentFilter = selectedFilter.value
    selectedFilter.value = null
    await store.saveFilter(currentFilter)
}

store.loadFilters()
</script>

<template>
    <div class="flex flex-row w-full max-w-screen-xl">
        <div v-if="(!selectedFilter || width >= mdWidth) && store.filters.length"
            class="flex-1 overflow-y-scroll scroll-smooth overflow-x-hidden max-h-[calc(100vh_+_0.75rem)] md:-ml-6 md:pl-6">
            <div v-for="filter in store.filters" :key="filter.id"
                @click="selectedFilter = filter"
                :class="{ '!shadow-lg !scale-[102%]': (selectedFilter && filter.id === selectedFilter.id) }"
                class="flex flex-row items-center my-3 p-3 md:mx-4 shadow-black shadow-xs bg-white hover:shadow-md hover:scale-[101%] dark:bg-gray-800 dark:text-white duration-200 cursor-pointer wrap-break-word">

                <div class="flex-1">
                    <h2 class="font-semibold flex flex-row justify-between items-start gap-2">
                        <span v-text="filter.entry" class="text-lg flex-1"></span>
                    </h2>

                    <p v-if="filter.part" class="flex flex-row gap-1 items-center" v-text="filter.part"></p>

                    <p v-if="filter.feed_id" class="flex flex-row gap-1 items-center" v-text="filter.feed_id"></p>
                </div>

                <button type="button" @click.stop="store.removeFilter(filter)" class="action-button hover:bg-red-700 hover:!border-red-700 group ml-auto" ref="delete-btn">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-trash group-hover:invert-100"></span>
                </button>
            </div>
        </div>

        <FilterForm v-if="selectedFilter" v-model="selectedFilter" @cancel="selectedFilter = null" @submit="saveFilter()" />

        <AddButton v-if="!selectedFilter" :add-item="createFilter" />
    </div>
</template>