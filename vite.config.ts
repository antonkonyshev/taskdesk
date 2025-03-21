import { resolve } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    root: resolve('./TaskDesk/static'),
    base: '/static/',
    plugins: [tailwindcss(), vue()],
    server: {
        host: '0.0.0.0',
        open: false,
        watch: {
            usePolling: true,
            disableGlobbing: false
        }
    },
    resolve: {
        extensions: ['.js', '.ts', '.json', '.css', '.sass', '.scss'],
    },
    assetsInclude: ['**/static/**/*.svg'],
    build: {
        manifest: true,
        emptyOutDir: true,
        outDir: resolve('./static/'),
        target: 'es2015',
        rollupOptions: {
            input: {
                navigationApp: resolve('./TaskDesk/static/js/navigationApp.ts'),
                tailwind: resolve('./TaskDesk/static/css/tailwind.css'),
                main: resolve('./TaskDesk/static/css/main.sass')
            },
            output: {
                chunkFileNames: undefined
            }
        }
    }
})