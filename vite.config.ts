import { resolve } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    root: resolve('TaskDesk/vite/'),
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
            TaskDesk: resolve("./TaskDesk/vite"),
            tasks: resolve("./tasks/vite"),
            news: resolve("./news/vite"),
        },
    },
    assetsInclude: ['**/vite/**/*.svg'],
    build: {
        manifest: true,
        emptyOutDir: true,
        outDir: resolve('./static/vite/'),
        target: 'es2015',
        rollupOptions: {
            input: {
                tailwind: resolve('TaskDesk/vite/css/tailwind.css'),
                main: resolve('TaskDesk/vite/css/main.sass'),
                navigationApp: resolve('TaskDesk/vite/js/navigation/NavigationApp.ts'),
                tasksApp: resolve('TaskDesk/vite/js/TasksApp.ts'),
                newsApp: resolve('TaskDesk/vite/js/NewsApp.ts'),
            },
            output: {
                chunkFileNames: undefined
            }
        }
    }
})
