import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Configuration pour GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/formation-generator/' : '/',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          markdown: ['marked', 'gray-matter', 'prism-react-renderer']
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@templates': path.resolve(__dirname, './src/templates'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@generated': path.resolve(__dirname, './public/generated')
    }
  },
  
  server: {
    port: 3000,
    open: true,
    cors: true,
    fs: {
      strict: false
    }
  },
  
  preview: {
    port: 4173,
    open: true
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      'marked',
      'gray-matter'
    ]
  },
  
  // Configuration pour les assets publics
  publicDir: 'public',
  
  // Variables d'environnement
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  }
})