import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import type { ConfigEnv, UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => ({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    host: '::',
    // Enable HTTP/2
    https: mode === 'production' ? {} : undefined,
  },
  build: {
    // Disable SSR for now
    ssr: false,
    // Output directory
    outDir: 'dist/client',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@floating-ui/react'
          ],
          'vendor-utils': ['date-fns', 'zod', 'zustand'],
          'stripe': ['@stripe/stripe-js'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Enable source maps for production builds to help with debugging
    sourcemap: mode !== 'production' ? 'inline' : false,
    // Minify the output for production builds
    minify: mode === 'production',
  },
  // Configure preview server to use HTTP/2
  preview: {
    https: {},
    port: 8080,
  },
}));
