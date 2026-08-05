/* global self, clients */
/* FASE 8.2 — service worker mínimo para Web Push / browser notifications. */

self.addEventListener("push", (event) => {
  let data = { title: "Lymiar", body: "", url: "/notificacoes/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Lymiar", {
      body: data.body || "Alteração observada",
      data: { url: data.url || "/notificacoes/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/notificacoes/";
  event.waitUntil(clients.openWindow(url));
});
