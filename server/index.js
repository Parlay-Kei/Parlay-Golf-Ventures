/**
 * Server Entry Point for Parlay Golf Ventures
 * 
 * This file sets up an Express server for server-side rendering (SSR)
 * with support for HTTP/2, compression, and CDN configuration.
 */

import express from 'express';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import sirv from 'sirv';

// Get the directory name using ESM-compatible approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

async function createServer() {
  const app = express();
  
  // Apply compression middleware
  app.use(compression());
  
  // HTTP/2 Server Push headers for critical assets
  app.use((req, res, next) => {
    // Only apply to HTML requests
    if (req.path.endsWith('.html') || req.path === '/') {
      // Add Link headers for preloading critical assets
      res.setHeader('Link', [
        '</fonts/inter-var.woff2>; rel=preload; as=font; crossorigin; importance=high',
        '</assets/main.css>; rel=preload; as=style',
        '</assets/main.js>; rel=preload; as=script',
      ]);
    }
    next();
  });
  
  // CDN configuration - in production, assets would be served from a CDN
  if (isProduction) {
    // Set up CDN URL for assets
    const cdnUrl = process.env.CDN_URL || '';
    
    // Rewrite asset URLs to use CDN in production
    app.use((req, res, next) => {
      res.locals.assetPath = (path) => {
        // Only apply CDN to static assets
        if (path.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff2|ico)$/)) {
          return `${cdnUrl}${path}`;
        }
        return path;
      };
      next();
    });
  }
  
  let vite;
  
  if (!isProduction) {
    // In development, create a Vite dev server
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    // Use Vite's connect middleware
    app.use(vite.middlewares);
  } else {
    // In production, serve built assets
    const sirv_options = {
      dev: false,
      etag: true,
      maxAge: 31536000, // 1 year
      immutable: true,
      gzip: true,
      brotli: true,
    };
    
    // Serve static assets with appropriate cache headers
    app.use(sirv(resolve(__dirname, '../dist/client'), sirv_options));
  }
  
  // SSR request handler
  app.use('*', async (req, res) => {
    const url = req.originalUrl;
    
    try {
      let template;
      
      // Read the HTML template
      if (!isProduction) {
        template = fs.readFileSync(resolve(__dirname, '../index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        template = fs.readFileSync(resolve(__dirname, '../dist/client/index.html'), 'utf-8');
      }
      
      // Completely disable SSR for now to focus on client-side rendering
      // Add a flag to indicate this is not SSR
      const clientOnlyScript = `<script>window.__IS_SSR__ = false;</script>`;
      const html = template.replace('<!--head-tags-->', clientOnlyScript);
      
      // Set cache control headers for HTML
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Send the HTML
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // If an error occurs, let Vite fix the stack trace in development
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e);
      res.status(500).end(e.message);
    }
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Start the server
createServer();
