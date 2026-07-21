import { io } from "socket.io-client";
import { API_URL } from "./apiClient";

// Module-level singleton — one live connection per tab, matching the single
// stored JWT in apiClient.js. Connected/disconnected by AuthContext.jsx
// alongside the authenticated/guest lifecycle, not by individual pages.
let socket = null;

export function connectSocket(token) {
  if (socket) socket.disconnect();
  socket = io(API_URL, { auth: { token } });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}

// Re-derives project participation server-side before joining — see
// realtime/socket.js's handleProjectJoin. Resolves { ok, error? }.
export function joinProjectRoom(projectId) {
  return new Promise((resolve) => {
    if (!socket) return resolve({ ok: false, error: "Not connected" });
    socket.emit("project:join", projectId, resolve);
  });
}
