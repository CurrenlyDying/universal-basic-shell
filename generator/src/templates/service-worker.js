export const serviceWorkerTemplate = `
self.addEventListener('fetch', (event) => {
  const reqUrl = new URL(event.request.url);
  if (!reqUrl.hostname.includes('__TARGET_DOMAIN__')) return;

  const upstream = '__WORKER_URL__?q=' + encodeURIComponent(reqUrl.toString());
  event.respondWith(fetch(upstream));
});
`;
