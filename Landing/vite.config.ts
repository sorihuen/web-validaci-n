import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/ 
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'https://botai.smartdataautomation.com/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api_backend_ai'),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Enviando petición a:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Recibiendo respuesta de:', req.url, 'con estado:', proxyRes.statusCode);
          });
        }
      }
    }
  }
})