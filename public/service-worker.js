/**
 * Parlay Golf Ventures Service Worker
 * 
 * This service worker provides:
 * - Offline capability
 * - Resource caching
 * - Background syncing
 * - Performance improvements
 */

// Cache names with version numbers to facilitate updates
const STATIC_CACHE_NAME = 'pgv-static-v1';
const DYNAMIC_CACHE_NAME = 'pgv-dynamic-v1';
const IMAGES_CACHE_NAME = 'pgv-images-v1';
const API_CACHE_NAME = 'pgv-api-v1';

// Resources to cache immediately when the service worker installs
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/fonts/inter-var.woff2',
  '/offline.html', // Fallback page for when offline
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old versions of our caches
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== IMAGES_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            ) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Successfully activated');
        return self.clients.claim(); // Take control of all clients
      })
  );
});

// Helper function to determine if a request is for an API call
const isApiRequest = (url) => {
  return url.pathname.startsWith('/api/');
};

// Helper function to determine if a request is for an image
const isImageRequest = (url) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
};

// Helper function to determine if a request should be cached
const shouldCache = (url) => {
  // Don't cache admin routes or authentication-related routes
  const nonCacheable = [
    '/admin',
    '/login',
    '/signup',
    '/verify-email',
    '/reset-password',
  ];
  
  return !nonCacheable.some(path => url.pathname.includes(path));
};

// Fetch event - handle network requests with caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Different caching strategies based on request type
  if (isApiRequest(url)) {
    // API requests: Network first, fallback to cache
    event.respondWith(networkFirstStrategy(event.request, API_CACHE_NAME));
  } else if (isImageRequest(url)) {
    // Image requests: Cache first, fallback to network
    event.respondWith(cacheFirstStrategy(event.request, IMAGES_CACHE_NAME));
  } else if (shouldCache(url)) {
    // Static assets: Cache first, fallback to network
    event.respondWith(cacheFirstStrategy(event.request, STATIC_CACHE_NAME));
  } else {
    // Other requests: Network only
    event.respondWith(fetch(event.request));
  }
});

// Network-first strategy: Try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    // Try to get from network
    const networkResponse = await fetch(request);
    
    // If successful, clone and cache the response
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, falling back to cache');
    
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache and for a page, return offline page
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Otherwise, propagate the error
    throw error;
  }
}

// Cache-first strategy: Try cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  // Try to get from cache
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // If not in cache, get from network
    const networkResponse = await fetch(request);
    
    // If successful, clone and cache the response
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed after cache miss');
    
    // If it's a page request, return offline page
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    // Otherwise, propagate the error
    throw error;
  }
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Function to sync stored form data when back online
async function syncForms() {
  try {
    // Open IndexedDB to get stored form submissions
    const db = await openDatabase();
    const pendingForms = await getPendingForms(db);
    
    console.log(`[Service Worker] Syncing ${pendingForms.length} pending forms`);
    
    // Process each pending form
    for (const form of pendingForms) {
      try {
        const response = await fetch(form.url, {
          method: form.method,
          headers: form.headers,
          body: form.body,
        });
        
        if (response.ok) {
          // If successful, remove from pending forms
          await removePendingForm(db, form.id);
          console.log(`[Service Worker] Successfully synced form ${form.id}`);
        }
      } catch (error) {
        console.error(`[Service Worker] Failed to sync form ${form.id}:`, error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error during form sync:', error);
  }
}

// Helper function to open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pgv-offline-forms', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-forms')) {
        db.createObjectStore('pending-forms', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Helper function to get pending forms from IndexedDB
function getPendingForms(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-forms', 'readonly');
    const store = transaction.objectStore('pending-forms');
    const request = store.getAll();
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Helper function to remove a pending form from IndexedDB
function removePendingForm(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-forms', 'readwrite');
    const store = transaction.objectStore('pending-forms');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}
