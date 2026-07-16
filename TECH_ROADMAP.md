# WorkBridge — Technical Roadmap

**Status: real backend migration complete.** `PlatformContext` (in-memory
`useState` mock data) has been fully removed. Every dashboard now runs
against the real Node.js/PostgreSQL backend in `backend/`:

- **Auth**: JWT-based, `AuthContext` (`src/app/context/AuthContext.jsx`) —
  real register/login/`/me`, token persisted in `localStorage`, route
  guarding by role in `App.jsx`.
- **Projects**: the full lifecycle (`INVITED → ACCEPTED → FUNDS_SECURED →
  WORK_IN_PROGRESS → FILES_SUBMITTED → COMPLETED`) is real, backed by
  `GET/POST /api/projects`, `PATCH /api/projects/:id`,
  `POST /api/projects/:id/secure-funds`, `POST /api/projects/:id/complete`.
- **Wallet**: real balance + ledger (`GET /api/wallet`,
  `POST /api/wallet/withdraw`).
- **Reviews**: real (`POST /api/reviews`, `GET /api/reviews?revieweeId=`).
- **Profiles**: real browse/self-edit (`GET /api/profiles?role=`,
  `PATCH /api/profiles/me`).

## Deliberately deferred (not a gap to "fix" — a scoped-out phase)

- **Chat/messaging** — no `messages` table exists. The old mock build had
  three independent fake chat surfaces (worker negotiation inbox, a
  "messages" tab, business inbox); all were cut rather than half-migrated.
  A real chat feature needs its own schema (thread/message tables, at
  minimum), not a bolt-on to this migration.
- **Open job marketplace** (workers browsing/applying to public postings,
  multiple candidates bidding on one posting) — the schema models
  business-initiated match-and-invite (one worker per project row from
  creation), matching the business plan's actual "Post Job → Get Matched →
  Select Worker" flow. `BusinessApplicants.jsx` and `WorkerJobFeed.jsx`'s
  old "browse & apply" concept were retired/deferred, not adapted.
- **Rich worker profile** (portfolio, education, work-history timeline) —
  trimmed to identity + skills/rate/bio (stored in `users.profile` JSONB) +
  real reviews. The old page's rest was 100% disconnected demo state before
  this migration too.
- **Real payment gateway** (Razorpay/Stripe/UPI) — `secure-funds` and
  `complete` remain internal-ledger-only; no external money actually moves
  yet. This is the next major phase once a gateway is chosen.
- **Admin panel** — still on `mockAdminData.js`; out of scope for this pass.
