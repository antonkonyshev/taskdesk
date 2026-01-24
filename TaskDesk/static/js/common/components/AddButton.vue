<template>
    <button type="button" @click="addItem()" ref="add-btn" class="fixed bottom-4 right-4 flex items-center size-18 rounded-full bg-green-300 hover:bg-green-700 group duration-200 cursor-pointer">
        <span class="inline-block size-7 bg-no-repeat bg-center bg-contain svg-plus w-full group-hover:invert-100 duration-200"></span>
    </button>
</template>

<script setup lang="ts">
const {
    addItem
} = defineProps<{
    addItem: () => void
}>()
</script>