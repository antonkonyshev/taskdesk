<template>
    <nav class="bg-white mt-[-1px] shadow-xs border-b border-b-gray-300 px-4 sm:px-6 pb-2.5 w-full dark:bg-gray-900 dark:shadow-xl dark:border-b-black">
        <!--<div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl"> -->
            <ul class="flex flex-row flex-wrap justify-start items-center gap-3 w-full max-w-screen-xl mx-auto font-medium sm:mt-0" role="menu">
                <li role="menuitem">
                    <router-link :to="routes.feeds" class="navigation-button sm:px-4">
                        <span class="navigation-icon svg-rss"></span>
                        <span v-text="t('message.feeds')"></span>
                    </router-link>
                </li>

                <li role="menuitem">
                    <router-link :to="routes.filters" class="navigation-button sm:px-4">
                        <span class="navigation-icon svg-funnel"></span>
                        <span v-text="t('message.filters')"></span>
                    </router-link>
                </li>

                <li role="menuitem">
                    <router-link :to="routes.news" class="navigation-button sm:px-4">
                        <span class="navigation-icon svg-inbox"></span>
                        <span v-text="t('message.unread')"></span>
                    </router-link>
                </li>

                <li role="menuitem">
                    <router-link :to="routes.reading" class="navigation-button sm:px-4">
                        <span class="navigation-icon svg-newspaper"></span>
                        <span v-text="t('message.reading')"></span>
                    </router-link>
                </li>
            </ul>
        <!--</div>-->
    </nav>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { routes } from 'news/navigation/routing'

const { t } = useI18n()
</script>