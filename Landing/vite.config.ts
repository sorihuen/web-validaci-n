import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

  // Configuración base
  return {
    plugins: [vue()],
    base: isProduction ? '/' : '/',
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
          rewrite: (path) => path.replace(
            new RegExp(`^${env.VITE_API_BASE_URL}`), 
            env.VITE_API_PREFIX || ''
          ),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('proxy error', err)
            })
            proxy.on('proxyReq', (proxyReq) => {
              console.log('Enviando petición a:', proxyReq.path)
            })
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('Recibiendo respuesta de:', req.url, 'con estado:', proxyRes.statusCode)
            })
          }
        }
      }
    },
    // Configuración para producción
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : {},
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            vendor: ['axios', 'lodash']
          }
        }
      }
    },
    // Definir variables de entorno para el cliente
    define: {
      'import.meta.env.PROD': JSON.stringify(isProduction),
      'import.meta.env.DEV': JSON.stringify(!isProduction),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'import.meta.env.VITE_API_TARGET': JSON.stringify(env.VITE_API_TARGET),
      'import.meta.env.VITE_API_PREFIX': JSON.stringify(env.VITE_API_PREFIX)
    }
  }
})