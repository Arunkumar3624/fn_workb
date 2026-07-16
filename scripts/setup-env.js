// Runs automatically before `npm run build` (via the "prebuild" npm lifecycle
// hook in package.json). Validates environment variables before the build
// starts rather than letting a missing var surface as a silent runtime bug.
//
// REQUIRED vars fail the build. VITE_API_URL is required as of the real
// backend migration (see TECH_ROADMAP.md) — apiClient.js falls back to
// http://localhost:4000 when it's unset, which is silently, completely
// broken in any deployed build (every dashboard/auth call fails). That's
// exactly the "missing var as silent runtime bug" this script exists to
// catch, so this one fails the build instead of just warning.
//
// RECOMMENDED vars only warn — Sentry and PostHog both no-op gracefully at
// runtime if their key is absent (see src/app/lib/monitoring.js and
// src/app/lib/analytics.js), so a missing analytics key should never be able
// to block a deploy.

const REQUIRED_VARS = [
  { name: "VITE_API_URL", why: "every API call falls back to localhost:4000 without it — completely broken in a deployed build" },
];

const RECOMMENDED_VARS = [
  { name: "VITE_SENTRY_DSN", why: "error monitoring will be disabled without it" },
  { name: "VITE_POSTHOG_KEY", why: "page view / event tracking will be disabled without it" },
];

function readEnv(name) {
  // Vite build-time env vars are process.env.VITE_* at this point (this
  // script runs under plain Node, before Vite's own import.meta.env exists).
  return process.env[name];
}

const missingRequired = REQUIRED_VARS.filter(({ name }) => !readEnv(name));
const missingRecommended = RECOMMENDED_VARS.filter(({ name }) => !readEnv(name));

if (missingRecommended.length > 0) {
  console.warn("\n[setup-env] Missing recommended environment variables:");
  missingRecommended.forEach(({ name, why }) => console.warn(`  - ${name}: ${why}`));
  console.warn("");
}

if (missingRequired.length > 0) {
  console.error("\n[setup-env] Build blocked — missing required environment variables:");
  missingRequired.forEach(({ name, why }) => console.error(`  - ${name}: ${why}`));
  console.error("\nSet these in your host's dashboard (Render/Vercel Environment Variables) and retry.\n");
  process.exit(1);
}

console.log("[setup-env] Environment check passed.");
