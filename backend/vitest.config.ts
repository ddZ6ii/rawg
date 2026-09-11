import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Explicit, rather than relying on vitest's default excludes — the
    // compiled `tsc -b` output previously leaked a duplicate `dist/**`
    // copy of every test file into the discovered set.
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
