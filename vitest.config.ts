import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    test: {
        name: 'taskdesk',
        root: '.',
        environment: 'jsdom',
        globals: true,
    },
    plugins: [vue()],
    resolve: {
        alias: {
            TaskDesk: resolve("./TaskDesk/vite"),
            tasks: resolve("./tasks/vite"),
            news: resolve("./news/vite"),
        },
    },
})
