<script setup lang="ts">
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'
import { useFilterStore } from 'news/store/filter'
import { Filter } from 'news/types/filter'

const store = useFilterStore()

async function addFilter() {
    const filter = { id: store.filters.length, entry: "test " + store.filters.length, part: 'full', feed: store.filters.length } as Filter
    await store.addFilter(filter)
}
</script>

<template>
    <div class="flex-1 overflow-y-scroll scroll-smooth overflow-x-hidden max-h-[calc(100vh_+_0.75rem)] md:-ml-6 md:pl-6">
        <div v-for="filter in store.filters" :key="filter.id"
            class="flex flex-row items-center my-3 p-3 md:mx-4 shadow-black shadow-xs bg-white hover:shadow-md hover:scale-[101%] dark:bg-gray-800 dark:text-white duration-200 cursor-pointer">

            <div class="flex-1">
                <h2 class="font-semibold flex flex-row justify-between items-start gap-2">
                    <span v-text="filter.entry" class="text-lg flex-1"></span>
                </h2>

                <p v-if="filter.part" class="flex flex-row gap-1 items-center" v-text="filter.part"></p>

                <p v-if="filter.feed" class="flex flex-row gap-1 items-center" v-text="filter.feed"></p>
            </div>

            <button type="button" @click="store.removeFilter(filter)" class="action-button hover:bg-red-700 hover:!border-red-700 group ml-auto">
                <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-trash group-hover:invert-100"></span>
            </button>
        </div>

        <AddButton :add-item="addFilter" />
    </div>
</template>