# WorkBridge — Technical Roadmap

The current build is a demonstration build: `PlatformContext` holds all state in
`useState`, in-memory, reset on refresh. This is intentional — it keeps demos
fast, reliable, and dependency-free for presentations. The items below are
what's deferred, not forgotten, before this becomes a real production system.

- **Backend Migration**: Transition `PlatformContext` from `useState` to a
  Node.js/PostgreSQL backend. Replace `advanceInviteStatus` calls with API
  endpoints (REST or GraphQL).
- **Store Unification**: Merge `invitesDb` and `businessThreadsDb` into a
  single canonical `projects` table to resolve the separate-store technical
  debt.
- **Multi-User Authentication**: Implement JWT-based Auth. Refactor
  `currentUser` state to be populated by the backend, ensuring
  `walletBalance` is scoped to the `userId`, not global state.
- **Production Wallet**: Connect `walletBalance` to a real payment gateway
  (Stripe/Razorpay) webhook to finalize completion logic on the server side.
