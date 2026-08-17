// Service worker mínimo — existe para o app ser instalável (ícone na tela
// inicial, abre em tela cheia) em Android/Chrome. Não faz cache agressivo:
// o painel é orientado a dados ao vivo (pacientes, agenda, financeiro), então
// suporte offline completo não é o objetivo — só a "casca" do app (HTML/JS/CSS)
// fica em cache, sempre priorizando a rede quando disponível, para nunca
// servir uma versão antiga da tela por engano.
const CACHE_NAME = "physioapp-shell-v1";
const SHELL_URLS = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Nunca intercepta chamadas de API — sempre rede, sem cache.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
  );
});
