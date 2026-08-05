// posthog-js (~227KB) is imported dynamically, not statically — a static
// `import posthog from "posthog-js"` gets bundled into the eager vendor
// chunk regardless of the PROD/key guard below (unlike @sentry/react in
// monitoring.js, which Rollup fully tree-shakes away when its DSN is
// unset). Analytics isn't on the critical render path, so there's no
// downside to only fetching it once it's actually going to be used.
let posthogModule = null;
let enabled = false;

// PostHog is production-only and fully optional — with no key set this is a
// silent no-op, matching the monitoring module's pattern. See
// scripts/setup-env.js.
export async function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;

  if (!import.meta.env.PROD || !key) {
    if (import.meta.env.DEV) {
      console.info("[analytics] PostHog disabled (dev mode or no VITE_POSTHOG_KEY set).");
    }
    return;
  }

  const { default: posthog } = await import("posthog-js");
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    // We call trackPageView ourselves on route change (SPA navigation isn't
    // a real page load), so autocapture's own pageview tracking is off.
    capture_pageview: false,
  });
  posthogModule = posthog;
  enabled = true;
}

export function trackPageView(path) {
  if (!enabled) return;
  posthogModule.capture("$pageview", { $current_url: path });
}

// Conversion funnel events — e.g. trackEvent("PaymentClicked", { amount }),
// trackEvent("JobPosted", { tier }).
export function trackEvent(name, properties) {
  if (!enabled) return;
  posthogModule.capture(name, properties);
}
