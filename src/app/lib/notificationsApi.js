import { apiFetch } from "./apiClient";

// The caller's own real notification history — { notifications, unreadCount }.
export function listNotifications() {
  return apiFetch("/api/notifications");
}

// Fired when the drawer opens (NotificationBell.jsx) — clears every unread
// row for this user at once, there's no per-item "mark read" affordance.
export function markNotificationsRead() {
  return apiFetch("/api/notifications/mark-read", { method: "PATCH" });
}
