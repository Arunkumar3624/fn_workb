# WorkBridge — Deployment Checklist

The git repo root is this `Frontend/` folder itself (not the parent
directory — `backend/` is a separate, currently-empty sibling and is not
part of this repo). Everything below that touches an account (GitHub,
Vercel, a domain registrar) has to happen on your side — I can't create
accounts, push to a remote, or buy/configure a domain for you. What's
already prepared in the repo is marked accordingly.

## 1. Push to GitHub

From inside `Frontend/`:

```bash
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub (empty, no README/gitignore), then:

```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

**Already prepared:** `.github/workflows/ci.yml` — runs `npm ci && npm run build`
on every push/PR to `main`, so a broken build gets caught before it ever
reaches Vercel. No secrets needed for this step; it's build validation only,
not a deploy.

## 2. Connect Vercel

1. [vercel.com/new](https://vercel.com/new) → Import your GitHub repo.
2. **Root Directory**: leave as the repo root (default) — the Vite project
   *is* the repo root now, no override needed.
3. Vercel auto-detects Vite; build command and output directory are already
   pinned in `vercel.json` (`npm run build` → `dist`) so you shouldn't need
   to touch the dashboard's build settings.
4. Deploy. Every push to `main` auto-deploys after this; PRs get preview URLs
   for free — no GitHub Actions deploy step needed, Vercel's own GitHub App
   handles it.

**Already prepared:** `vercel.json` also adds a SPA rewrite
(`/(.*) → /index.html`) — without it, a direct link to e.g. `/business` or
`/worker/workspace` 404s on refresh, since this is a client-side-routed
single-page app (`react-router-dom` `BrowserRouter`), not multi-page.

## 3. Custom domain + SSL

1. Buy the domain (Namecheap, Google Domains, etc.) if you don't have one.
2. In Vercel: Project → Settings → Domains → add `workbridge.io` (or
   whichever you land on).
3. Vercel gives you the DNS records to add at your registrar (an `A` record
   or `CNAME` depending on root vs. subdomain). SSL is automatic and free
   once DNS propagates — no separate certificate step.

## 4. Get indexed

- **Already prepared:** `index.html`'s `<meta name="robots">` is set to
  `index, follow`, and `public/robots.txt` + `public/sitemap.xml` now exist,
  listing the four public marketing routes (`/`, `/find-work`,
  `/hire-talent`, `/enterprise`) — dashboard/auth routes are deliberately
  left out of the sitemap since they're not content meant to be indexed.
- **You still need to**: once the real domain is live, open both files and
  replace the placeholder `https://workbridge.io` with your actual domain,
  then submit the sitemap in
  [Google Search Console](https://search.google.com/search-console) (verify
  domain ownership via the DNS TXT record they give you, same place you're
  already adding DNS records for step 3).

## What's deliberately not done

Per `TECH_ROADMAP.md` — this is still a demonstration build (in-memory state,
no backend, single-persona wallet). None of that blocks putting the frontend
live for demos/feedback; it only matters once real users need real accounts
and real money to move.
