import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }): UserConfig => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    // Configuración para desarrollo
    server: {
      cors: true,
      proxy: {
        [env.VITE_API_BASE_URL]: {
          target: env.VITE_API_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_API_BASE_URL}`), env.VITE_API_PREFIX || ''),
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
    },
    // Configuración para producción
    build: {
      // Configuración de assets para producción
      assetsDir: 'assets',
      // Minificar el código en producción
      minify: 'terser',
      // Configuración de Terser
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      // Generar sourcemaps para producción (opcional)
      sourcemap: false,
      // Configuración de rollup
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
          },
        },
      },
    },
    // Configuración de alias para producción
    define: {
      __APP_ENV__: JSON.stringify(env.NODE_ENV || 'production'),
    },
  }
})