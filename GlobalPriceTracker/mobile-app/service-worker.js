// Service Worker for Global Price Tracker
const CACHE_NAME = 'global-price-tracker-v2';
const OFFLINE_URL = 'offline.html';

// Files to cache initially
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/offline.html',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Push notification event - when server sends a push notification
self.addEventListener('push', event => {
  console.log('📬 Push notification received:', event);

  let notificationData = {
    title: 'Global Price Tracker',
    body: 'New price update available',
    badge: '/assets/icon-192x192.png',
    icon: '/assets/icon-192x192.png',
    tag: 'price-notification',
    requireInteraction: false
  };

  // Parse custom notification data if provided
  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.log('Push data:', event.data.text());
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      badge: notificationData.badge,
      icon: notificationData.icon,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data || {},
      actions: [
        {
          action: 'open',
          title: 'View',
          icon: '/assets/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Dismiss',
          icon: '/assets/icon-192x192.png'
        }
      ]
    })
  );
});

// Notification click event - handle user interaction with notification
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.notification.tag);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  const action = event.notification.data?.action;

  if (action === 'view_product') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        // Check if app is already open
        for (let i = 0; i < clients.length; i++) {
          if (clients[i].url === urlToOpen && 'focus' in clients[i]) {
            return clients[i].focus();
          }
        }
        // Open new window if not found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } else if (action === 'buy_now') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        for (let i = 0; i < clients.length; i++) {
          if ('focus' in clients[i]) {
            clients[i].focus();
            clients[i].postMessage({
              type: 'PRODUCT_AVAILABLE',
              productId: event.notification.data?.productId
            });
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } else if (action === 'view_deals') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        for (let i = 0; i < clients.length; i++) {
          if (clients[i].url.includes('/deals') || clients[i].url === '/') {
            return clients[i].focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', event => {
  console.log('❌ Notification dismissed:', event.notification.tag);
});

// Message event - handle messages from clients
self.addEventListener('message', event => {
  console.log('📨 Message received in SW:', event.data);

  if (event.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(event.data.title, event.data.options);
  }
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle API requests differently - network first, then offline response
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response for API calls that succeed
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // For API failures, check cache or return offline response
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If we don't have a cached API response, return a generic offline response
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // For non-API requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Add to cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // If network request fails and it's a page request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Listen for push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data.text() || 'New price update available!',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Update',
        icon: '/assets/icon-checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Tesco Price Comparison', options)
  );
});

// Listen for notification click events
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the main app interface with the specific content
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});