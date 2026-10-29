const CACHE_NAME = 'cluster0-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/main.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// NUEVO: Escuchar cuando el servidor envíe una notificación push
self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : { title: "Recordatorio", body: "Tienes una tarea próxima a vencer" };
    
    const options = {
        body: data.body,
        icon: "/icons/icon-192x192.png", // Asegúrate de apuntar a tus íconos existentes
        badge: "/icons/icon-192x192.png",
        vibrate: [200, 100, 200],
        data: { url: data.url || "/dashboard" }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// NUEVO: Manejar el clic en la notificación para abrir la app en el dashboard
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || "/dashboard")
    );
});