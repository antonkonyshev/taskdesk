<template>
    <nav class="bg-white mt-[-1px] shadow-xs z-7 border-b border-b-gray-300 px-4 sm:px-6 pb-2.5 w-full dark:bg-gray-900 dark:shadow-xl dark:border-b-black duration-200">

        <ul class="flex flex-row flex-wrap justify-start items-center gap-3 w-full max-w-screen-xl mx-auto font-medium sm:mt-0" role="menu">
            <li role="menuitem">
                <router-link :to="routes.news" @click="preferencesMenu = false"
                    class="navigation-button sm:px-4">

                    <span class="navigation-icon svg-inbox"></span>
                    <span v-text="t('message.unread')"></span>
                </router-link>
            </li>

            <li role="menuitem">
                <router-link :to="routes.reading" @click="preferencesMenu = false" 
                    class="navigation-button sm:px-4">

                    <span class="navigation-icon svg-newspaper"></span>
                    <span v-text="t('message.reading')"></span>
                </router-link>
            </li>

            <li role="menuitem" class="relative">
                <button type="button"
                    class="navigation-button sm:px-4 cursor-pointer"
                    @click="preferencesMenu = !preferencesMenu"
                    id="preferences-btn">

                    <span class="navigation-icon svg-cog"></span>
                    <span v-text="t('message.preferences')"></span>
                </button>

                <div class="absolute hidden z-10 right-0 mt-2 w-48 bg-white shadow-black shadow-sm py-1 border-b-gray-900 dark:bg-gray-900"
                    :class="{'!block': preferencesMenu}" role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="preferences-btn">

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

const { t } = useI18n()
const preferencesMenu = ref<boolean>(false)
</script>