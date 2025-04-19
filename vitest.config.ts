import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import i18n from 'static/js/i18n'

export default defineConfig({
    test: {
        name: 'tasks',
        root: '.',
        environment: 'jsdom',
        globals: true,
    },
    plugins: [vue()],
    resolve: {
        alias: {
            tasks: resolve("./tasks/static/tasks"),
            TaskDesk: resolve("./TaskDesk/static"),
        },
    },
})
