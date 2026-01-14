<script setup lang="ts">
import AddButton from 'TaskDesk/js/common/components/AddButton.vue'
import { useFeedStore } from 'news/store/feed'
import { Feed } from 'news/types/feed'

const feedStore = useFeedStore()

async function addFeed() {
    const feed = { id: feedStore.feeds.length, title: "Test " + feedStore.feeds.length, url: "https://test.com/rss" } as Feed
    await feedStore.addFeed(feed)
}
</script>

<template>
    <div class="flex-1 overflow-y-scroll scroll-smooth overflow-x-hidden max-h-[calc(100vh_+_0.75rem)] md:-ml-6 md:pl-6">
        <div v-for="feed in feedStore.feeds" :key="feed.id"
            class="flex flex-row items-center my-3 p-3 md:mx-4 shadow-black shadow-xs bg-white hover:shadow-md hover:scale-[101%] dark:bg-gray-800 dark:text-white duration-200 cursor-pointer">

            <div class="flex-1">
                <h2 class="font-semibold flex flex-row justify-between items-start gap-2">
                    <span v-text="feed.title" class="text-lg flex-1"></span>
                </h2>

                <p class="flex flex-row gap-1 items-center" v-text="feed.url"></p>
            </div>

            <button type="button" @click="feedStore.removeFeed(feed)" class="action-button hover:bg-red-700 hover:!border-red-700 group ml-auto">
                <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-trash group-hover:invert-100"></span>
            </button>
        </div>

        <AddButton :add-item="addFeed" />
    </div>
</template>