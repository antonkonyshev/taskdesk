<template>
    <div class="flex flex-col items-center">
        <NewsNavigation />

        <RouterView :key="route.fullPath" />
    </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import NewsNavigation from './components/navigation/NewsNavigation.vue'

const route = useRoute()
</script>