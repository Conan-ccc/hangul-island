// Register the service worker. On update, set a flag; the home screen reloads on the next start tap (never mid-activity).
export function registerSW(swUrl) {
  if (!('serviceWorker' in navigator)) return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) window.__swUpdateReady = true; });
  navigator.serviceWorker.register(swUrl).catch(() => {});
}
