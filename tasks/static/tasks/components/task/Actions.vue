<script setup lang="ts">
import { useTaskStore } from '../../store/task'

const store = useTaskStore()
</script>

<template>
    <aside class="flex flex-row flex-nowrap gap-3">
        <button v-if="store.history.canUndo" type="button" @click="store.history.undo()"
            class="action-button hover:bg-gray-300">
            <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-arrow-left"></span>
        </button>

        <button v-if="store.history.canRedo" type="button" @click="store.history.redo()"
            class="action-button hover:bg-gray-300">
            <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-arrow-right"></span>
        </button>

        <span class="flex-1"></span>

        <button type="button" @click="store.remove" class="action-button hover:bg-red-700 hover:!border-red-700 group">
            <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-trash group-hover:invert-100"></span>
        </button>

        <button type="button" @click="store.markDone"
            class="action-button hover:bg-green-700 hover:!border-green-700 group">
            <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-check group-hover:invert-100"></span>
        </button>
    </aside>
</template>