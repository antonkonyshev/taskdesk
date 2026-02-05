<template>
    <span v-if="value"
        class="absolute -right-2 -top-[1px] text-xs text-white bg-td-primary dark:text-black dark:bg-td-secondary rounded-xl py-0 px-1"
        v-text="value"></span>
</template>

<script setup lang="ts">
defineProps({
    value: Number
})
</script>