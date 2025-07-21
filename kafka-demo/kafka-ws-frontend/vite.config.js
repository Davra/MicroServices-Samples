import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    base: '/microservices/kafkaui/', // Ensures relative paths for assets change with your microservice name 
    plugins: [vue()],
    server: {
        port: 5173,
        open: true
    }
});
