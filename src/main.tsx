import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { LoadingProvider } from './contexts/LoadingContext'

// Import apps
import App from './App'
import DiagnosticApp from './DiagnosticApp'
import MinimalApp from './MinimalApp'

// Client-side only rendering to avoid hydration issues
const rootElement = document.getElementById('root')
if (rootElement) {
  try {
    console.log('Mounting application...')
    // Force client-side rendering
    window.__IS_SSR__ = false;
    
    // Log environment variables for debugging
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL_SET: !!import.meta.env.VITE_SUPABASE_URL,
      SUPABASE_KEY_SET: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      APP_VERSION: import.meta.env.VITE_APP_VERSION || 'Not Set'
    });
    
    // Use the regular App with LoadingProvider
    createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <LoadingProvider>
            <App />
          </LoadingProvider>
        </BrowserRouter>
      </React.StrictMode>
    )
  } catch (error) {
    console.error('Error rendering application:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #d32f2f;">Application Error</h1>
        <p>Failed to initialize the application. Please check the console for details.</p>
        <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
          ${error instanceof Error ? error.message : 'Unknown error'}
        </pre>
        <p>Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    `
  }
} else {
  console.error('Root element not found')
  document.body.innerHTML = '<div style="padding: 20px;">Root element not found</div>'
}
