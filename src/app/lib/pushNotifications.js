import { apiFetch } from "./apiClient";

// Registered once at app startup (see App.jsx), independent of whether the
// user has actually opted into notifications yet — the Service Worker has
// to already be active before pushManager.subscribe() can be called from
// the Settings toggle.
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch((err) => {
    console.error("[push] Service Worker registration failed:", err);
  });
}

// The Push API wants the VAPID key as a raw Uint8Array, but browsers only
// ever hand you (and this app only ever stores/transmits) the base64url
// string form — standard conversion, same one every Push API guide uses.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// "unsupported" (no Push API on this browser — Safari <16.4, most in-app
// browsers), "not-configured" (backend has no VAPID keys set yet),
// "denied" (user explicitly blocked notifications — only undoable from the
// browser's own site settings, nothing this app can do), "subscribed",
// "unsubscribed".
export async function getPushStatus() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";

  const { publicKey, configured } = await apiFetch("/api/push/vapid-public-key");
  if (!configured || !publicKey) return "not-configured";

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? "subscribed" : "unsubscribed";
}

// Requests the browser's native permission prompt (only fires the first
// time — after that the browser remembers the choice) and, once granted,
// registers the subscription both locally and with the backend.
export async function subscribeToPush() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const { publicKey, configured } = await apiFetch("/api/push/vapid-public-key");
  if (!configured || !publicKey) {
    throw new Error("Push notifications aren't configured on this deploy yet.");
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  await apiFetch("/api/push/subscribe", { method: "POST", body: subscription.toJSON() });
  return true;
}

export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await apiFetch("/api/push/unsubscribe", { method: "POST", body: { endpoint } }).catch(() => {
    // The browser-side unsubscribe already succeeded (the part the user
    // actually cares about) — a failed backend cleanup just leaves one
    // stale row that a future failed send will prune anyway (see
    // push.service.js's sendPushToUser).
  });
}
