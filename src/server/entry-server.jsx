/**
 * Server Entry Point for React SSR
 * 
 * This file handles server-side rendering of the React application.
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '../App';

// Add a global flag to indicate server-side rendering
global.__IS_SSR__ = true;

/**
 * Generate preload links for critical assets
 * @returns {string} HTML string of preload link tags
 */
function generatePreloadLinks() {
  return `
    <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="modulepreload" href="/assets/main.js">
  `;
}

/**
 * Generate additional head tags for SSR
 * @returns {string} HTML string of head tags
 */
function generateHeadTags() {
  return `
    <meta name="ssr-rendered" content="true">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>window.__IS_SSR__ = true;</script>
  `;
}

/**
 * Render the app to HTML
 * @param {string} url - The URL to render
 * @returns {Object} Object containing rendered HTML and preload links
 */
export async function render(url) {
  // Create a fresh React tree for each request to avoid cross-request state pollution
  const appHtml = renderToString(
    <StaticRouter location={url}>
      <App ssrMode={true} />
    </StaticRouter>
  );

  // Generate preload links and head tags
  const preloadLinks = generatePreloadLinks();
  const headTags = generateHeadTags();

  return { html: appHtml, preloadLinks, headTags };
}
