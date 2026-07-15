import posthog from "posthog-js";

let enabled = false;

// PostHog is production-only and fully optional — with no key set this is a
// silent no-op, matching the monitoring module's pattern. See
// scripts/setup-env.js.
export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;

  if (!import.meta.env.PROD || !key) {
    if (import.meta.env.DEV) {
      console.info("[analytics] PostHog disabled (dev mode or no VITE_POSTHOG_KEY set).");
    }
    return;
  }

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    // We call trackPageView ourselves on route change (SPA navigation isn't
    // a real page load), so autocapture's own pageview tracking is off.
    capture_pageview: false,
  });
  enabled = true;
}

export function trackPageView(path) {
  if (!enabled) return;
  posthog.capture("$pageview", { $current_url: path });
}

// Conversion funnel events — e.g. trackEvent("PaymentClicked", { amount }),
// trackEvent("JobPosted", { tier }).
export function trackEvent(name, properties) {
  if (!enabled) return;
  posthog.capture(name, properties);
}
