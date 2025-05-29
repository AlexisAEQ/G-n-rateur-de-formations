import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()  // Plugin Vite pour Tailwind v4
  ],
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015'
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@templates': path.resolve(__dirname, './src/templates')
    }
  },
  
  server: {
    port: 3000,
    open: true,
    cors: true
  }
})