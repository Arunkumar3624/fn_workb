// WorkBridge's push notification Service Worker. Deliberately minimal —
// this app isn't an offline-first PWA, so there's no asset caching here,
// just the two events the Push API needs: showing a notification when a
// push arrives, and routing a click on it back into the app.

self.addEventListener("push", (event) => {
  let data = { title: "WorkBridge", body: "You have a new update.", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Non-JSON payload (shouldn't happen — push.service.js always sends
    // JSON) — fall back to the generic copy above rather than throwing.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.png",
      badge: "/favicon.png",
      data: { url: data.url },
    })
  );
});

// Focuses an already-open WorkBridge tab and navigates it, rather than
// always opening a new one — most users clicking a notification already
// have the app open somewhere.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
