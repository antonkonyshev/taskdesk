<template>
    <div class="flex flex-col">
        <NewsNavigation />

        <RouterView />
    </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useNewsStore } from 'news/store/news'
import NewsNavigation from './components/navigation/NewsNavigation.vue'

const newsStore = useNewsStore()

async function initialize() {
    await newsStore.loadNews()
}

initialize()
</script>