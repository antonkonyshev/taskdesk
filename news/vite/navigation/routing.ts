import FeedList from 'news/components/list/FeedList.vue'
import FilterList from 'news/components/list/FilterList.vue'
import NewsList from 'news/components/list/NewsList.vue'
import PreferencesForm from 'news/components/form/PreferencesForm.vue'
import { createRouter, createWebHistory } from 'vue-router'

export const routes = {
    news: { path: "/news", component: NewsList, props: { request: "unread" }},
    reading: { path: "/news/reading", component: NewsList, props: { request: "reading" }},
    feeds: { path: "/news/feeds", component: FeedList },
    filters: { path: "/news/filters", component: FilterList },
    viewed: { path: "/news/viewed", component: NewsList, props: { request: "hidden" }},
    preferences: { path: "/news/preferences", component: PreferencesForm },
    default: { path: "/", component: NewsList, props: { request: "unread" }},
}

export const router = createRouter({
    history: createWebHistory(),
    routes: [ routes.news, routes.reading, routes.viewed, routes.feeds, routes.filters, routes.preferences, routes.default ],
})