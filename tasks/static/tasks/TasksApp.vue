<template>
    <p v-for="task in tasks" :key="task.id" v-text="task.title"></p>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tasks = ref([{ id: 1, title: "Test 1" }, { id: 2, title: "Test 2" }])

onMounted(() => {
    console.log("TasksApp mounted")
})
</script>