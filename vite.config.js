import { resolve } from 'path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig((mode) => {
    return {
        root: resolve('./TaskDesk/static'),
        base: '/static/',
        plugins: [tailwindcss(),],
        server: {
            host: '0.0.0.0',
            open: false,
            watch: {
                usePolling: true,
                disableGlobbing: false
            }
        },
        resolve: {
            extensions: ['.js', '.json', '.css', '.sass', '.scss'],
        },
        build: {
            manifest: true,
            emptyOutDir: true,
            outDir: resolve('./static/'),
            target: 'es2015',
            rollupOptions: {
                input: {
                    main: resolve('./TaskDesk/static/js/main.js'),
                    tailwind: resolve('./TaskDesk/static/css/main.css')
                },
                output: {
                    chunkFileNames: undefined
                }
            }
        }
    };
});