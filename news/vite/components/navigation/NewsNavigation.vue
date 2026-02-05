<template>
    <nav class="bg-td-gray-light inset-shadow-[0_0_5px] inset-shadow-td-gray-dark/30 border-b border-b-gray-300 px-2 w-full dark:bg-gray-950 dark:border-b-black duration-200">

        <ul class="flex flex-row flex-wrap justify-start items-center gap-3 w-full max-w-screen-xl mx-auto font-medium" role="menu">
            <li role="menuitem">
                <router-link :to="routes.news" @click="preferencesMenu = false"
                    class="navigation-button relative">

                    <span class="navigation-icon svg-inbox"></span>
                    <span v-text="t('message.unread')"></span>
                    <Counter :value="store.newsMeta.unread" />
                </router-link>
            </li>

            <li role="menuitem">
                <router-link :to="routes.reading" @click="preferencesMenu = false" 
                    class="navigation-button relative">

                    <span class="navigation-icon svg-newspaper"></span>
                    <span v-text="t('message.reading')"></span>
                    <Counter :value="store.newsMeta.reading" />
                </router-link>
            </li>

            <li role="menuitem" class="relative">
                <button type="button"
                    class="navigation-button cursor-pointer"
                    @click="preferencesMenu = !preferencesMenu"
                    id="settings-btn">

                    <span class="navigation-icon svg-cog"></span>
                    <span v-text="t('message.settings')"></span>
                </button>

                <div class="absolute hidden z-10 right-0 mt-2 w-48 bg-white shadow-black shadow-sm py-1 border-b-gray-900 dark:bg-gray-900"
                    :class="{'!block': preferencesMenu}" role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="settings-btn">

                    <router-link :to="routes.viewed" @click="preferencesMenu = false"
                        class="navigation-button px-4">

                        <span class="navigation-icon svg-eye"></span>
                        <span v-text="t('message.viewed')"></span>
                    </router-link>

                    <router-link :to="routes.feeds" @click="preferencesMenu = false"
                        class="navigation-button px-4">

                        <span class="navigation-icon svg-rss"></span>
                        <span v-text="t('message.feeds')"></span>
                    </router-link>

                    <router-link :to="routes.filters" @click="preferencesMenu = false"
                        class="navigation-button px-4">

                        <span class="navigation-icon svg-funnel"></span>
                        <span v-text="t('message.filters')"></span>
                    </router-link>

                    <router-link :to="routes.preferences" @click="preferencesMenu = false"
                        class="navigation-button px-4">

                        <span class="navigation-icon svg-cog"></span>
                        <span v-text="t('message.preferences')"></span>
                    </router-link>
                </div>
            </li>
        </ul>
    </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { routes } from 'news/navigation/routing'
import { useNewsStore } from 'news/store/news'
import Counter from '../partials/Counter.vue'

const { t } = useI18n()
const preferencesMenu = ref<boolean>(false)
const store = useNewsStore()
</script>