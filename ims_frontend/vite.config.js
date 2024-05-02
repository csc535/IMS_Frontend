import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            src: "/src",            
            images: "/src/assets/images",
            styles: "/src/assets/styles",
            components: "/src/Components",
            pages: "/src/Pages",
            services: "/src/Services",
        },
    },
})
