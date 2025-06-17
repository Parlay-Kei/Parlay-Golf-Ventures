/**
 * Client Entry Point for React Hydration
 * 
 * This file handles client-side hydration of the server-rendered React application.
 */

import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { prefetchCommonRoutes } from '../lib/utils/routePrefetching';

// Initialize performance monitoring and real user monitoring
import '../lib/monitoring/rum';

// Disable React strict mode in production to avoid double-rendering issues with hydration
const StrictModeWrapper = process.env.NODE_ENV === 'development' 
  ? React.StrictMode 
  : React.Fragment;

// Wait for the DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  
  // Check if we're in SSR mode or client-only mode
  const isSSR = window.__IS_SSR__;
  
  if (isSSR) {
    // Hydrate the app for SSR
    hydrateRoot(
      rootElement,
      <StrictModeWrapper>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictModeWrapper>
    );
  } else {
    // Create a fresh root for client-only rendering
    const root = createRoot(rootElement);
    root.render(
      <StrictModeWrapper>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictModeWrapper>
    );
  }

  // Prefetch common routes after hydration/rendering
  setTimeout(() => {
    prefetchCommonRoutes();
  }, 2000);

  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
});
