// MedPort Enhanced Service Worker - Phase 6.3 Offline Capabilities
const CACHE_NAME = 'medport-v3';
const DATA_CACHE_NAME = 'medport-data-v3';
const STATIC_CACHE_NAME = 'medport-static-v3';

// Core app files to cache
const STATIC_URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// API endpoints to cache for offline use
const API_ENDPOINTS_TO_CACHE = [
  '/api/transport-requests',
  '/api/unit-assignment',
  '/api/analytics',
  '/api/facilities',
  '/api/agencies'
];

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  API: 'network-first',
  IMAGES: 'stale-while-revalidate',
  ANALYTICS: 'cache-first'
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[MedPort] Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[MedPort] Service Worker: Caching static files');
        return cache.addAll(STATIC_URLS_TO_CACHE);
      }),
      caches.open(DATA_CACHE_NAME).then(cache => {
        console.log('[MedPort] Service Worker: Caching API endpoints');
        return cache.addAll(API_ENDPOINTS_TO_CACHE.map(url => new Request(url, { method: 'GET' })));
      })
    ]).then(() => {
      console.log('[MedPort] Service Worker: Installation complete');
      return self.skipWaiting();
    }).catch(error => {
      console.error('[MedPort] Service Worker: Installation failed', error);
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[MedPort] Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (![CACHE_NAME, DATA_CACHE_NAME, STATIC_CACHE_NAME].includes(cacheName)) {
            console.log('[MedPort] Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[MedPort] Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement advanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and non-HTTP requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[MedPort] Service Worker: Network failed, serving from cache', request.url);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This data is not available offline',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[MedPort] Service Worker: Failed to fetch static asset', request.url, error);
    return new Response('Offline', { status: 503 });
  }
}

// Handle navigation requests with cache-first strategy
async function handleNavigationRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    return caches.match('/');
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[MedPort] Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  } else if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalyticsData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    console.log('[MedPort] Service Worker: Starting offline data sync...');
    
    // Get all clients to notify them of sync status
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_STATUS',
        status: 'started',
        timestamp: new Date().toISOString()
      });
    });
    
    // Simulate sync process (in real implementation, this would sync pending operations)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('[MedPort] Service Worker: Offline data sync completed');
    
    // Notify clients of sync completion
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_STATUS',
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('[MedPort] Service Worker: Sync failed', error);
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_STATUS',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Sync analytics data
async function syncAnalyticsData() {
  try {
    console.log('[MedPort] Service Worker: Starting analytics sync...');
    
    // Get all clients to notify them of sync status
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'ANALYTICS_SYNC_STATUS',
        status: 'started',
        timestamp: new Date().toISOString()
      });
    });
    
    // Simulate analytics sync process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('[MedPort] Service Worker: Analytics sync completed');
    
    // Notify clients of sync completion
    clients.forEach(client => {
      client.postMessage({
        type: 'ANALYTICS_SYNC_STATUS',
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('[MedPort] Service Worker: Analytics sync failed', error);
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'ANALYTICS_SYNC_STATUS',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[MedPort] Service Worker: Push notification received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('MedPort Update', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[MedPort] Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle message events from main thread
self.addEventListener('message', (event) => {
  console.log('[MedPort] Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      timestamp: new Date().toISOString()
    });
  }
});

console.log('[MedPort] Service Worker: Loaded successfully');
