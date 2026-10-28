import { defineConfig } from 'vite'

// Served at the root of stillsmith.is-my.app, so assets resolve from '/'.
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    cssMinify: true,
  },
})
