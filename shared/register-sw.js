// Register the service worker. On update, set a flag; the home screen reloads on the next start tap (never mid-activity).
export function registerSW(swUrl) {
  if (!('serviceWorker' in navigator)) return;
  // no offline cache while developing on this PC (it would serve stale files)
  if (location.hostname === 'localhost' && !location.search.includes('sw=1')) return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) window.__swUpdateReady = true; });
  navigator.serviceWorker.register(swUrl).catch(() => {});
}
