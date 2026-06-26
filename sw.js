// Self-destroying service worker for the apex (beyondtypical.dev).
// The game used to live here and registered a PWA service worker that cached its app shell. Now
// the apex serves a plain static page, but returning visitors still have that old SW controlling
// the origin — it serves the stale game, which then 404s on /data/cards.json. A 404 at /sw.js
// can't fix that (a failed update keeps the old SW). So we serve THIS instead: it unregisters the
// old worker, clears its caches, and reloads, so visitors land on the real page. New visitors
// never register it (the landing page doesn't call register()).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        /* ignore */
      }
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        try {
          client.navigate(client.url);
        } catch (e) {
          /* ignore */
        }
      }
    })(),
  );
});
