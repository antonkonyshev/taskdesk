<template>
    <div class="flex flex-row">
        <div class="flex-1 overflow-y-scroll scroll-smooth max-h-screen">
            <div v-for="task in tasks" :key="task.id" @click="selectTask(task)" class="border-b-gray-300 border-b hover:bg-gray-300 cursor-pointer duration-200 dark:bg-gray-700 dark:text-white dark:hover:text-gray-700 p-3">
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

                <span v-if="task.due" v-text="formatDate(task.due)"></span>
            </div>
        </div>

        <div v-if="selectedTask" class="flex-1 lg:flex-2 p-4 border-l border-l-gray-300 hidden sm:block">
            <h2 class="font-semibold text-2xl flex flex-row items-center">
                <span class="flex-1">{{ selectedTask.description }}</span>
                <span v-if="selectedTask.wait" v-text="t('message.delayed_task')" class="bg-gray-200 text-nowrap px-2 py-0.5 rounded-xl text-lg"></span>
                <span v-if="selectedTask.depends.size" v-text="t('message.blocked_task')" class="bg-gray-200 text-nowrap px-2 py-0.5 rounded-xl text-lg"></span>
                <span v-if="selectedTask.blocks.size" v-text="t('message.blocking_tasks')" class="bg-red-200 text-nowrap px-2 py-0.5 rounded-xl text-lg"></span>
            </h2>

            <p v-if="selectedTask.project || selectedTask.tags" class="flex flex-row items-center pt-3 gap-2">
                <span class="flex-1">{{ t('message.project') }}: {{ selectedTask.project ? selectedTask.project : t("message.not_specified").toLowerCase() }}</span>
                <span v-if="selectedTask.tags" v-for="tag in selectedTask.tags" v-text="tag" class="bg-gray-200 text-nowrap px-2 pb-0.5 rounded-xl"></span>
            </p>

            <p v-if="selectedTask.due || selectedTask.entry" class="flex flex-col items-start lg:flex-row justify-between lg:items-center">
                <span v-if="selectedTask.due">{{ t("message.due_date") }}: {{ formatDate(selectedTask.due) }}</span>
                <span v-if="selectedTask.entry">{{ t("message.creation_date") }}: {{ formatDate(selectedTask.entry) }}</span>
            </p>

            <p v-if="selectedTask.wait" class="py-3">
                {{ t("message.will_become_active") }} {{ formatDate(selectedTask.wait) }}
            </p>

            <p v-if="selectedTask.depends.size" class="py-3">
                <span v-text="t('message.this_task_depends_on_the_following_tasks') + ':'" class="font-semibold"></span>
                <ul>
                    <li v-for="task in selectedTask.depends">
                        <a href="#" v-text="task.description" @click="selectTask(task)" class="underline hover:text-green-700 hover:no-underline duration-200 py-0.5 inline-block"></a>
                    </li>
                </ul>
            </p>

            <p v-if="selectedTask.blocks.size" class="py-3">
                <span v-text="t('message.this_task_blocks_the_following_tasks') + ':'" class="font-semibold"></span>
                <ul>
                    <li v-for="task in selectedTask.blocks">
                        <a href="#" v-text="task.description" @click="selectTask(task)" class="underline hover:text-green-700 hover:no-underline duration-200 py-0.5 inline-block"></a>
                    </li>
                </ul>
            </p>

            <p v-if="selectedTask.annotations.length" class="py-3">
                <span v-text="t('message.annotations')" class="font-semibold"></span>
                <ul>
                    <li v-for="annotation in selectedTask.annotations" class="flex flex-row">
                        <span v-text="annotation.description" class="flex-1"></span>
                        <span v-text="formatDate(annotation.entry)"></span>
                    </li>
                </ul>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import moment from 'moment/min/moment-with-locales'

const { t } = useI18n()

interface Annotation {
    entry?: Date
    description: string
}

interface Task {
    id?: number
    uuid?: string
    description?: string
    urgency?: number
    project?: string
    tags?: Array<string>
    entry?: Date
    modifier?: Date
    due?: Date
    wait?: Date
    depends?: Set<Task>
    blocks?: Set<Task>
    status?: string
    annotations?: Array<Annotation>
}

const tasks = ref<Array<Task>>([])
const selectedTask = ref(null)

function formatDate(value: Date): string {
    return moment(value).fromNow()
}

function selectTask(task: Task) {
    selectedTask.value = task
}

function addDependencies(task): Task {
    if (typeof task.depends === "undefined") {
        task.depends = new Set<Task>()
    }
    if (typeof task.blocks === "undefined") {
        task.blocks = new Set<Task>()
    }
    const dependencies = new Set<Task>()
    for (let idx = 0; idx < task.depends.length; idx++) {
        const dep = tasks.value.find(elem => elem.uuid == task.depends[idx])
        if (dep) {
            dep.blocks.add(task)
            dependencies.add(dep)
        }
    }
    task.depends = dependencies
    return task as Task
}

function removeDependencies(task: Task) {
    task.depends.forEach(it => it.blocks.delete(task))
    task.blocks.forEach(it => it.depends.delete(task))
    task.depends.clear()
    task.blocks.clear()
}

async function fetchTasks(): Promise<void> {
    // @ts-ignore
    const rsp = await fetch(window.API_BASE_URL + "/task")
    if (rsp.ok) {
        (await rsp.json()).forEach((task) => {
            const idx = tasks.value.findIndex((elem) => elem.uuid == task.uuid)
            task = addDependencies(task)
            if (idx >= 0) {
                removeDependencies(tasks.value[idx]);
                tasks.value[idx] = task
            } else {
                tasks.value.push(task)
            }
            if (task.depends && task.depends.length) {
            }
        });
        if (tasks.value.length && !selectedTask.value) {
            selectTask(tasks.value[0])
        }
    }
}
fetchTasks()
</script>