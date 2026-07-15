# WorkBridge — Deployment Checklist

The git repo root is this `Frontend/` folder itself (not the parent
directory — `backend/` is a separate, currently-empty sibling and is not
part of this repo). Everything below that touches an account (GitHub,
Render/Vercel, a domain registrar, Sentry, PostHog) has to happen on your
side — I can't create accounts, push to a remote, or buy/configure a domain
for you. What's already prepared in the repo is marked accordingly.

**Status: live on Render.** The site is deployed from the `main` branch.
`vercel.json` and `render.yaml` are both kept in the repo — Render is the
active host, Vercel config is there in case you ever run a second
environment there or switch.

## 1. Environment variables

Copy `.env.example` → `.env.local` for local dev. Every var is optional —
`scripts/setup-env.js` runs automatically before every build (via the
`prebuild` npm hook) and only *fails* the build for vars nothing depends on
yet (currently none — the list is empty on purpose, see the script's
comments). Missing `VITE_SENTRY_DSN` or `VITE_POSTHOG_KEY` just warns and
that integration no-ops at runtime; it will never block a deploy.

Set real values in Render: Dashboard → your service → Environment. Never
commit `.env.local`.

## 2. Branching & deployment rules

**a. Shipping a feature safely (staging/preview):**

```bash
git checkout -b feature/whatever
# ...work, commit...
git push -u origin feature/whatever
```

Open a PR into `main`. `.github/workflows/ci.yml` runs `npm ci && npm run
build` automatically — that's your safety net before anything touches
production, catching a broken build before a human even reviews the diff.

Render's free tier doesn't do per-PR preview URLs (that's a paid-plan
feature there). Two options if you want a real preview link to click before
merging:
- Spin up a second Render static site pointed at your feature branch instead
  of `main`, use it as a standing staging environment, delete it when done.
- Import the same GitHub repo into Vercel too (`vercel.json` is already
  sitting there ready) — Vercel gives every PR a free preview URL natively,
  no extra config. `main` deploys can stay on Render; Vercel becomes a
  preview-only tool.

**b. Merging to main (production deploy):**

Merge the PR once CI is green. Render is watching `main` and auto-deploys on
merge — nothing else to trigger manually. Watch the deploy log in the Render
dashboard for the first minute in case the live env vars differ from local.

**c. Database migrations (once the backend exists):**

There is no database yet — `PlatformContext` is in-memory `useState` (see
`TECH_ROADMAP.md`). This section is a placeholder for future-you:

1. Migrations run against a staging DB first, never directly against
   production.
2. Take a backup/snapshot immediately before running a migration against
   production data.
3. Migrations are a separate deploy step from the frontend build — they
   should never be bundled into `npm run build`. Once the Node/PostgreSQL
   backend from `TECH_ROADMAP.md` exists, this becomes its own CI job
   (`npm run migrate`) gated behind manual approval for production, not
   an automatic step on every push.

## 3. Custom domain + SSL

1. Buy the domain (Namecheap, Google Domains, etc.) if you don't have one.
2. In Render: your service → Settings → Custom Domains → add
   `workbridge.io` (or whichever you land on).
3. Render gives you the DNS record to add at your registrar (a `CNAME`, or
   an `ANAME`/`ALIAS` for the bare root domain). SSL is automatic and free
   once DNS propagates — no separate certificate step.

**Already prepared:** `render.yaml` includes the SPA rewrite
(`/* → /index.html`) as IaC — but since the service was created manually via
the dashboard rather than as a Blueprint, that rule isn't active yet unless
you've also added it by hand under your service's Redirects/Rewrites
settings. Check that first if any deep link (e.g. `/business` on refresh)
404s.

## 4. Get indexed

- **Already prepared:** `index.html`'s `<meta name="robots">` is set to
  `index, follow`, and `public/robots.txt` + `public/sitemap.xml` now exist,
  listing the four public marketing routes (`/`, `/find-work`,
  `/hire-talent`, `/enterprise`) — dashboard/auth routes are deliberately
  left out of the sitemap since they're not content meant to be indexed.
- **You still need to**: open both files and replace the placeholder
  `https://workbridge.io` with your actual live domain, then submit the
  sitemap in
  [Google Search Console](https://search.google.com/search-console) (verify
  domain ownership via the DNS TXT record they give you, same place you're
  already adding DNS records for step 3).

## What's deliberately not done

Per `TECH_ROADMAP.md` — this is still a demonstration build (in-memory state,
no backend, single-persona wallet). None of that blocks the frontend being
live for demos/feedback; it only matters once real users need real accounts
and real money to move.
