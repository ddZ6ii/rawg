/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      },
    },
    // @rawg/shared is a workspace package, symlinked into node_modules —
    // un-ignore it so its rebuilt dist/ (via `tsc -b --watch`) actually
    // triggers Vite instead of being silently skipped like real
    // node_modules.
    watch: {
      ignored: ['!**/node_modules/@rawg/shared/**'],
    },
  },
  optimizeDeps: {
    // Excluding it stops Vite from pre-bundling it into a cached chunk —
    // without this, edits to packages/shared only show up after a manual
    // dev-server restart, since the cache doesn't invalidate on the
    // dependency's own file changes.
    exclude: ['@rawg/shared'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
})
