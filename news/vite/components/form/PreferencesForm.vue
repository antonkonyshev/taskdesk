<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const newsListLength = ref<number>(10)
const newsListLengthForAutoLoad = ref<number>(4)

onMounted(() => {
    const savedPreferences = localStorage.getItem('newsPreferences')
    if (savedPreferences) {
        try {
            const prefs = JSON.parse(savedPreferences)
            newsListLength.value = prefs.newsListLength || 10
            newsListLengthForAutoLoad.value = prefs.newsListLengthForAutoLoad || 4
        } catch (e) {}
    }
})

const savePreferences = () => {
    localStorage.setItem('newsPreferences', JSON.stringify({
        newsListLength: newsListLength.value,
        newsListLengthForAutoLoad: newsListLengthForAutoLoad.value
    }))
    router.back()
    // useRouter().replace('/news')
}
</script>

<template>
    <div class="flex flex-col items-start w-full xl:max-w-screen-xl bg-white dark:bg-gray-800 shadow-md p-4 my-3 sm:px-6 sm:py-5 sm:my-4">
        <h1 class="text-xl text-left font-bold mb-4 dark:text-white"
            v-text="t('message.preferences')"></h1>
        
        <form @submit.prevent="savePreferences" name="preferencesForm">
            <div class="mb-3">
                <label for="newsListLength_id" v-text="t('message.news_list_length')" />
                <input id="newsListLength_id" name="newsListLength"
                    v-model.number="newsListLength" type="number" min="1"
                    class="input-field rounded-lg min-w-xs sm:min-w-sm md:min-w-md lg:min-w-lg xl:min-w-xl dark:!bg-gray-700" />
            </div>

            <div class="mb-6">
                <label for="newsListLengthForAutoLoad_id" v-text="t('message.news_list_length_for_auto_load')" />
                <input id="newsListLengthForAutoLoad_id" name="newsListLengthForAutoLoad"
                    v-model.number="newsListLengthForAutoLoad" type="number" min="1"
                    class="input-field rounded-lg min-w-xs sm:min-w-sm md:min-w-md lg:min-w-lg xl:min-w-xl dark:!bg-gray-700" />
            </div>

            <button type="submit" ref="submit-btn" v-text="t('message.save')"
                class="bg-green-700 hover:bg-green-600 text-white transition-colors duration-200 hover:cursor-pointer font-bold py-3 px-6 mb-3 rounded-lg min-w-xs sm:min-w-sm">
            </button>
        </form>
    </div>
</template>