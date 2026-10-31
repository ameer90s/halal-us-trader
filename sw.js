// Service Worker - حلال تريدير
const CACHE_NAME = "halal-trader-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// استقبال إشعار Push
self.addEventListener("push", event => {
  let data = { title: "حلال تريدير", body: "توصية جديدة جاهزة", url: "./" };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {}

  const options = {
    body: data.body || "لديك توصية جديدة",
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    dir: "rtl",
    lang: "ar",
    vibrate: [200, 100, 200],
    data: { url: data.url || "./" },
    actions: [
      { action: "open", title: "فتح التوصية" }
    ],
    requireInteraction: true,
    tag: "halal-recommendation"
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "حلال تريدير • توصية جديدة", options)
  );
});

// عند الضغط على الإشعار
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "./";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.postMessage({ type: "NOTIFICATION_CLICK", url });
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
