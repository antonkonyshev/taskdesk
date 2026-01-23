import { resolve } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    root: resolve('TaskDesk/static/'),
    base: '/static/',
    plugins: [tailwindcss(), vue()],
    server: {
        host: '0.0.0.0',
        open: false,
        allowedHosts: true,
        cors: true,
        watch: {
            usePolling: true,
            disableGlobbing: false
        }
    },
    resolve: {
        extensions: ['.js', '.ts', '.vue', '.json', '.css', '.sass', '.scss'],
        alias: {
            TaskDesk: resolve("./TaskDesk/static"),
            tasks: resolve("./tasks/static/tasks"),
            notes: resolve("./notes/static/notes"),
            news: resolve("./news/static/news"),
        },
    },
    assetsInclude: ['**/static/**/*.svg'],
    build: {
        manifest: true,
        emptyOutDir: true,
        outDir: resolve('./static/vite/'),
        target: 'es2015',
        rollupOptions: {
            input: {
                tailwind: resolve('TaskDesk/static/css/tailwind.css'),
                main: resolve('TaskDesk/static/css/main.sass'),
                navigationApp: resolve('TaskDesk/static/js/navigation/NavigationApp.ts'),
                tasksApp: resolve('TaskDesk/static/js/TasksApp.ts'),
                newsApp: resolve('TaskDesk/static/js/NewsApp.ts'),
            },
            output: {
                chunkFileNames: undefined
            }
        }
    }
})
