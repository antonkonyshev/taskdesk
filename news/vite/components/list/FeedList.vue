<script setup lang="ts">
import { shallowRef } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useFeedStore } from '../../store/feed'
import { Feed } from '../../types/feed'
import FeedForm from 'news/components/form/FeedForm.vue'
import Toolbar from 'TaskDesk/js/common/components/Toolbar.vue'

const mdWidth = 640;
const { t } = useI18n()
const { width } = useWindowSize()
const store = useFeedStore()
const selectedFeed = shallowRef<Feed | null>(null)

async function createFeed() {
    selectedFeed.value = { title: "", url: "" } as Feed
}

async function saveFeed() {
    if (!selectedFeed.value) {
        return
    }
    const currentFeed = selectedFeed.value
    selectedFeed.value = null
    await store.saveFeed(currentFeed)
}
</script>

<template>
    <div class="flex flex-row w-full max-w-screen-xl">
        <div v-if="(!selectedFeed || width >= mdWidth) && store.feeds.length"
            class="flex-1 md:-ml-6 md:pl-6">
            <div v-for="feed in store.feeds" :key="feed.id"
                @click="selectedFeed = feed"
                :class="{ '!shadow-lg !scale-[102%]': (selectedFeed && feed.id === selectedFeed.id) }"
                class="flex flex-row items-center my-3 p-3 shadow-black shadow-xs bg-white hover:shadow-md hover:scale-[101%] dark:bg-gray-800 dark:text-white duration-200 cursor-pointer">

                <div class="flex-1 break-all">
                    <h2 class="font-semibold flex flex-row justify-between items-start gap-2">
                        <span v-text="feed.title" class="text-lg flex-1"></span>
                    </h2>

                    <p class="flex flex-row gap-1 items-center" v-text="feed.url"></p>
                </div>

                <button type="button" @click.stop="store.removeFeed(feed)" class="action-button hover:bg-red-700 hover:!border-red-700 group ml-auto" ref="delete-btn">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-trash dark:invert-100 group-hover:invert-100"></span>
                </button>
            </div>

        </div>

        <FeedForm v-if="selectedFeed" :key="selectedFeed.id || 'new'" v-model="selectedFeed" @cancel="selectedFeed = null" @submit="saveFeed()" />

        <Toolbar>
            <ul v-if="!selectedFeed" class="flex flex-row justify-end items-center text-center xs:gap-3 xs:px-3 sm:gap-5 sm:px-5 md:gap-6 md:px-6 border-l-gray-300 border-l" role="menu">
                <li role="menuitem">
                    <a href="" @click.stop.prevent="createFeed"
                        class="navigation-button flex !flex-col !px-4">

                        <span class="navigation-icon !mx-0 svg-plus-circle"></span>
                        <span class="text-sm" v-text="t('message.add_feed')"></span>
                    </a>
                </li>
            </ul>
        </Toolbar>
    </div>
</template>