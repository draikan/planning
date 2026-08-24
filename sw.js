/* Créneaux — service worker
   Stratégie différenciée :
   - le document HTML contient tout le code de l'application : on interroge
     TOUJOURS le réseau en premier, et on ne retombe sur le cache que hors ligne.
     Sans cela, une modification de index.html ne parvient jamais à l'utilisateur.
   - les icônes et le manifeste ne changent presque jamais : cache d'abord,
     avec rafraîchissement silencieux en arrière-plan.
   Incrémenter VERSION purge les anciens caches. */

const VERSION = "v2";
const CACHE = "creneaux-" + VERSION;
const STATIQUES = ["./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(STATIQUES.concat(["./", "./index.html"])))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Géocodage et itinéraires : données vivantes, jamais mises en cache.
  if (url.hostname.includes("api-adresse") || url.hostname.includes("project-osrm")) return;

  // Le document : réseau d'abord, cache en secours hors ligne.
  const estDocument = req.mode === "navigate"
    || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  if (estDocument) {
    e.respondWith(
      fetch(req)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(req, copie));
          return rep;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  // Le reste : cache d'abord, mise à jour silencieuse en arrière-plan.
  e.respondWith(
    caches.match(req).then((cachee) => {
      const reseau = fetch(req)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(req, copie));
          return rep;
        })
        .catch(() => cachee);
      return cachee || reseau;
    })
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "activer-maintenant") self.skipWaiting();
});
