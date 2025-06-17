// vite.config.ts
import { defineConfig } from "file:///C:/Users/Aspir/Mr%20Hubbard/PGV/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Aspir/Mr%20Hubbard/PGV/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { visualizer } from "file:///C:/Users/Aspir/Mr%20Hubbard/PGV/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Aspir\\Mr Hubbard\\PGV";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 8080,
    host: "::",
    // Enable HTTP/2
    https: mode === "production" ? {} : void 0
  },
  build: {
    // Enable SSR build
    ssr: mode === "ssr" ? "/src/server/entry-server.jsx" : false,
    // Output directory
    outDir: mode === "ssr" ? "dist/server" : "dist/client",
    rollupOptions: {
      // Externalize node modules for SSR build
      external: mode === "ssr" ? ["react", "react-dom", "react-router-dom"] : [],
      output: {
        manualChunks: mode !== "ssr" ? {
          // Split vendor chunks for better caching
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-toast"],
          "vendor-utils": ["date-fns", "zod", "zustand"]
        } : void 0
      }
    },
    // Enable source maps for production builds to help with debugging
    sourcemap: mode !== "production" ? "inline" : false,
    // Minify the output for production builds
    minify: mode === "production"
  },
  // Configure preview server to use HTTP/2
  preview: {
    https: {},
    port: 8080
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBc3BpclxcXFxNciBIdWJiYXJkXFxcXFBHVlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQXNwaXJcXFxcTXIgSHViYmFyZFxcXFxQR1ZcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FzcGlyL01yJTIwSHViYmFyZC9QR1Yvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInO1xuaW1wb3J0IHR5cGUgeyBDb25maWdFbnYsIFVzZXJDb25maWcgfSBmcm9tICd2aXRlJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH06IENvbmZpZ0Vudik6IFVzZXJDb25maWcgPT4gKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgdmlzdWFsaXplcih7XG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgZmlsZW5hbWU6ICdkaXN0L3N0YXRzLmh0bWwnLFxuICAgICAgZ3ppcFNpemU6IHRydWUsXG4gICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogODA4MCxcbiAgICBob3N0OiAnOjonLFxuICAgIC8vIEVuYWJsZSBIVFRQLzJcbiAgICBodHRwczogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nID8ge30gOiB1bmRlZmluZWQsXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gRW5hYmxlIFNTUiBidWlsZFxuICAgIHNzcjogbW9kZSA9PT0gJ3NzcicgPyAnL3NyYy9zZXJ2ZXIvZW50cnktc2VydmVyLmpzeCcgOiBmYWxzZSxcbiAgICAvLyBPdXRwdXQgZGlyZWN0b3J5XG4gICAgb3V0RGlyOiBtb2RlID09PSAnc3NyJyA/ICdkaXN0L3NlcnZlcicgOiAnZGlzdC9jbGllbnQnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIC8vIEV4dGVybmFsaXplIG5vZGUgbW9kdWxlcyBmb3IgU1NSIGJ1aWxkXG4gICAgICBleHRlcm5hbDogbW9kZSA9PT0gJ3NzcicgPyBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJ10gOiBbXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IG1vZGUgIT09ICdzc3InID8ge1xuICAgICAgICAgIC8vIFNwbGl0IHZlbmRvciBjaHVua3MgZm9yIGJldHRlciBjYWNoaW5nXG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAndmVuZG9yLXVpJzogWydAcmFkaXgtdWkvcmVhY3QtZGlhbG9nJywgJ0ByYWRpeC11aS9yZWFjdC1kcm9wZG93bi1tZW51JywgJ0ByYWRpeC11aS9yZWFjdC10b2FzdCddLFxuICAgICAgICAgICd2ZW5kb3ItdXRpbHMnOiBbJ2RhdGUtZm5zJywgJ3pvZCcsICd6dXN0YW5kJ10sXG4gICAgICAgIH0gOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIGZvciBwcm9kdWN0aW9uIGJ1aWxkcyB0byBoZWxwIHdpdGggZGVidWdnaW5nXG4gICAgc291cmNlbWFwOiBtb2RlICE9PSAncHJvZHVjdGlvbicgPyAnaW5saW5lJyA6IGZhbHNlLFxuICAgIC8vIE1pbmlmeSB0aGUgb3V0cHV0IGZvciBwcm9kdWN0aW9uIGJ1aWxkc1xuICAgIG1pbmlmeTogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nLFxuICB9LFxuICAvLyBDb25maWd1cmUgcHJldmlldyBzZXJ2ZXIgdG8gdXNlIEhUVFAvMlxuICBwcmV2aWV3OiB7XG4gICAgaHR0cHM6IHt9LFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFSLFNBQVMsb0JBQW9CO0FBQ2xULE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxrQkFBa0I7QUFIM0IsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQThCO0FBQUEsRUFDaEUsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLE1BQ1QsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsVUFBVTtBQUFBLE1BQ1YsWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBRU4sT0FBTyxTQUFTLGVBQWUsQ0FBQyxJQUFJO0FBQUEsRUFDdEM7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsS0FBSyxTQUFTLFFBQVEsaUNBQWlDO0FBQUE7QUFBQSxJQUV2RCxRQUFRLFNBQVMsUUFBUSxnQkFBZ0I7QUFBQSxJQUN6QyxlQUFlO0FBQUE7QUFBQSxNQUViLFVBQVUsU0FBUyxRQUFRLENBQUMsU0FBUyxhQUFhLGtCQUFrQixJQUFJLENBQUM7QUFBQSxNQUN6RSxRQUFRO0FBQUEsUUFDTixjQUFjLFNBQVMsUUFBUTtBQUFBO0FBQUEsVUFFN0IsZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELGFBQWEsQ0FBQywwQkFBMEIsaUNBQWlDLHVCQUF1QjtBQUFBLFVBQ2hHLGdCQUFnQixDQUFDLFlBQVksT0FBTyxTQUFTO0FBQUEsUUFDL0MsSUFBSTtBQUFBLE1BQ047QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLFdBQVcsU0FBUyxlQUFlLFdBQVc7QUFBQTtBQUFBLElBRTlDLFFBQVEsU0FBUztBQUFBLEVBQ25CO0FBQUE7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE9BQU8sQ0FBQztBQUFBLElBQ1IsTUFBTTtBQUFBLEVBQ1I7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
