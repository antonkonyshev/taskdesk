<template>
    <div class="flex flex-col items-center">
        <NewsNavigation />

        <RouterView />
    </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import NewsNavigation from './components/navigation/NewsNavigation.vue'
</script>