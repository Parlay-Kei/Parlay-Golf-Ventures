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
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: [
        // Externalize server-side modules that shouldn't be bundled for client
        '@sendgrid/mail',
        'path',
        'fs',
        'crypto'
      ],
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          
          // UI libraries
          'vendor-ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip'
          ],
          'vendor-ui-other': [
            '@floating-ui/react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'lucide-react'
          ],
          
          // Utility libraries
          'vendor-utils-core': ['date-fns', 'zod'],
          'vendor-utils-state': ['zustand'],
          'vendor-utils-other': ['react-hook-form', '@hookform/resolvers'],
          
          // External services
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
