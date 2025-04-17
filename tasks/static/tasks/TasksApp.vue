<template>
    <div class="flex flex-row">
        <div class="flex-1 overflow-y-scroll scroll-smooth max-h-screen">
            <div v-for="task in store.tasks" :key="task.id" @click="store.select(task)" class="border-b-gray-400 border-b hover:bg-gray-300 cursor-pointer duration-200 dark:bg-gray-700 dark:text-white dark:hover:text-gray-700 p-3">
                <h2 class="font-semibold flex flex-row justify-between items-center">
                    <span v-text="task.description" class="text-lg flex-1" :class="{'text-gray-600': task.depends.size || task.wait}"></span>
                    <span v-if="task.wait" v-text="t('message.delayed_task')" class="bg-gray-200 text-xs text-nowrap px-2 py-0.5 rounded-xl m-2.5"></span>
                    <span v-if="task.depends.size" v-text="t('message.blocked_task')" class="bg-gray-200 text-xs text-nowrap px-2 py-0.5 rounded-xl mx-2.5"></span>
                    <span v-if="task.blocks.size" v-text="t('message.blocking_tasks')" class="bg-red-700 text-white text-xs text-nowrap px-2 py-0.5 rounded-xl mx-2.5"></span>
                    <span v-if="task.project" v-text="task.project" class="bg-gray-200 text-xs text-nowrap px-2 py-0.5 rounded-xl"></span>
                </h2>

                <ul v-if="task.tags" class="flex flex-row flex-wrap gap-2">
                    <li v-for="tag in task.tags" v-text="tag" class="bg-gray-200 text-xs text-nowrap px-2 py-0.5 rounded-xl"></li>
                </ul>

                <span v-if="task.due" v-text="t('message.due_date') + ' ' + moment(task.due).fromNow()"></span>
            </div>
        </div>

        <div v-if="store.task" class="flex-1 lg:flex-2 px-4 py-3.5 border-l border-l-gray-400 hidden sm:block">
            <aside class="flex flex-row flex-nowrap gap-3">
                <button v-if="store.history.canUndo" type="button" @click="store.history.undo()" class="action-button hover:bg-gray-300">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-arrow-left"></span>
                </button>

                <button v-if="store.history.canRedo" type="button" @click="store.history.redo()" class="action-button hover:bg-gray-300">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-arrow-right"></span>
                </button>

                <span class="flex-1"></span>

                <button type="button" class="action-button hover:bg-gray-300">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-pencil"></span>
                </button>

                <button type="button" class="action-button hover:bg-red-700 hover:!border-red-700 group">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-trash group-hover:invert-100"></span>
                </button>

                <button type="button" class="action-button hover:bg-green-700 hover:!border-green-700 group">
                    <span class="inline-block size-6 bg-no-repeat bg-center bg-contain svg-check group-hover:invert-100"></span>
                </button>
            </aside>

            <h2 class="font-semibold text-2xl flex flex-row items-center pt-4 pb-3">
                <span class="flex-1">{{ store.task.description }}</span>
                <span v-if="store.task.wait" v-text="t('message.delayed_task')" class="bg-gray-200 text-nowrap px-2 py-0.5 rounded-xl text-lg"></span>
                <span v-if="store.task.depends.size" v-text="t('message.blocked_task')" class="bg-gray-200 text-nowrap px-2 py-0.5 rounded-xl text-lg"></span>
                <span v-if="store.task.blocks.size" v-text="t('message.blocking_tasks')" class="bg-red-200 text-nowrap px-2 py-0.5 rounded-xl text-lg"></span>
            </h2>

            <p v-if="store.task.project || store.task.tags" class="flex flex-row items-center gap-2">
                <span class="flex-1">{{ t('message.project') }}: {{ store.task.project ? store.task.project : t("message.not_specified").toLowerCase() }}</span>
                <span v-if="store.task.tags" v-for="tag in store.task.tags" v-text="tag" class="bg-gray-200 text-nowrap px-2 pb-0.5 rounded-xl"></span>
            </p>

            <p v-if="store.task.due || store.task.entry" class="flex flex-col items-start lg:flex-row justify-between lg:items-center">
                <span v-if="store.task.due">{{ t("message.due_date") }} {{ moment(store.task.due).fromNow() }}</span>
                <span v-if="store.task.entry">{{ t("message.created") }} {{ moment(store.task.entry).fromNow() }}</span>
            </p>

            <p v-if="store.task.wait" class="py-3">
                {{ t("message.will_become_active") }} {{ moment(store.task.wait).fromNow() }}
            </p>

            <p v-if="store.task.depends.size" class="py-3">
                <span v-text="t('message.this_task_depends_on_the_following_tasks') + ':'" class="font-semibold"></span>
                <ul>
                    <li v-for="task in store.task.depends">
                        <a href="#" v-text="task.description" @click="store.select(task)" class="underline hover:text-green-700 hover:no-underline duration-200 py-0.5 inline-block"></a>
                    </li>
                </ul>
            </p>

            <p v-if="store.task.blocks.size" class="py-3">
                <span v-text="t('message.this_task_blocks_the_following_tasks') + ':'" class="font-semibold"></span>
                <ul>
                    <li v-for="task in store.task.blocks">
                        <a href="#" v-text="task.description" @click="store.select(task)" class="underline hover:text-green-700 hover:no-underline duration-200 py-0.5 inline-block"></a>
                    </li>
                </ul>
            </p>

            <p v-if="store.task.annotations.length" class="py-3">
                <span v-text="t('message.annotations')" class="font-semibold"></span>
                <ul>
                    <li v-for="annotation in store.task.annotations" class="flex flex-row">
                        <span v-text="annotation.description" class="flex-1"></span>
                        <span v-text="moment(annotation.entry).fromNow()"></span>
                    </li>
                </ul>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'
import { useTaskStore } from './store/task'

const { t } = useI18n()

const store = useTaskStore()
store.fetchTasks()
</script>