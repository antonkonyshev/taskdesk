import FeedList from 'news/components/FeedList.vue'
import NewsList from 'news/components/NewsList.vue'
import { createRouter, createWebHistory } from 'vue-router'

export const routes = {
    news: { path: "/news", component: NewsList },
    feeds: { path: "/news/feeds", component: FeedList },
    filters: { path: "/news/filters" },
    reading: { path: "/news/reading" },
}

export const router = createRouter({
    history: createWebHistory(),
    routes: [ routes.news, routes.feeds, routes.filters, routes.reading ],
})