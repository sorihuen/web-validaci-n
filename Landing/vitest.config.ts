import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

// Configuración específica para pruebas
export default defineConfig({
  ...viteConfig,
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    globals: true,
    setupFiles: [],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
