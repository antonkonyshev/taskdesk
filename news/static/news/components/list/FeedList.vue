<script setup lang="ts">
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'
import { useFeedStore } from 'news/store/feed'
import { Feed } from 'news/types/feed'
import FeedForm from 'news/components/form/FeedForm.vue'

const mdWidth = 768;
const { width } = useWindowSize()
const store = useFeedStore()
const selectedFeed = ref<Feed>(null)

async function createFeed() {
    selectedFeed.value = { title: "", url: "" } as Feed
}
</script>

<template>
    <div class="flex flex-row">
        <div v-if="(!selectedFeed || width >= mdWidth) && store.feeds.length"
            class="flex-1 overflow-y-scroll scroll-smooth overflow-x-hidden max-h-[calc(100vh_+_0.75rem)] md:-ml-6 md:pl-6">
            <div v-for="feed in store.feeds" :key="feed.id"
                :class="{ '!shadow-lg !scale-[102%]': (selectedFeed && feed.id === selectedFeed.id) }"
                class="flex flex-row items-center my-3 p-3 md:mx-4 shadow-black shadow-xs bg-white hover:shadow-md hover:scale-[101%] dark:bg-gray-800 dark:text-white duration-200 cursor-pointer">

                <div class="flex-1">
                    <h2 class="font-semibold flex flex-row justify-between items-start gap-2">
                        <span v-text="feed.title" class="text-lg flex-1"></span>
                    </h2>

                    <p class="flex flex-row gap-1 items-center" v-text="feed.url"></p>
                </div>

                <button type="button" @click="store.removeFeed(feed)" class="action-button hover:bg-red-700 hover:!border-red-700 group ml-auto" ref="delete-btn">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-trash group-hover:invert-100"></span>
                </button>
            </div>

        </div>

        <FeedForm v-if="selectedFeed" v-model="selectedFeed" @cancel="selectedFeed = null" @submit="store.saveFeed(selectedFeed)" />

        <AddButton v-if="!selectedFeed" :add-item="createFeed" />
    </div>
</template>