import * as Sentry from "@sentry/react";

// Sentry is production-only and fully optional — with no DSN set (e.g. every
// local dev session, and any deploy that hasn't configured one yet) this is
// a silent no-op rather than a build/runtime failure. See scripts/setup-env.js.
export function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!import.meta.env.PROD || !dsn) {
    if (import.meta.env.DEV) {
      console.info("[monitoring] Sentry disabled (dev mode or no VITE_SENTRY_DSN set).");
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Low sample rate — this is a demo build, not a high-traffic app yet.
    tracesSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration()],
    // Dev-server noise (HMR failures, React DevTools warnings) should never
    // reach Sentry — this build only initializes in production anyway, but
    // ignoreErrors is kept as a second layer against known-noisy messages.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],
  });
}

export const captureError = (error, context) => {
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
};
