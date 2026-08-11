import { Award, BadgeCheck, Building2, Lock, ShieldCheck, User } from "lucide-react";
import { verifiedRingClass } from "../../utils/verification";

const VERIFICATION_TIERS = [
  {
    id: "worker-id",
    badge: "Worker ID Verified",
    price: 0,
    priceLabel: "Free",
    subLabel: "Launch offer — normally ₹199",
    features: ["Aadhaar / ID checked", "Verified Trust Badge on Profile"],
    icon: ShieldCheck,
    // "ID Verified — Trust Guard": the real emerald ring already live on
    // every verified worker's avatar today (WorkerDashboard/Sidebar/Profile).
    frameVariant: "emerald",
  },
  {
    id: "skill",
    badge: "Skill Verified",
    price: 299,
    features: ["Skill test passed", "Verified Trust Badge on Profile", "Priority Algorithm Matching"],
    icon: Award,
    // No distinct frame promised for this tier — stays a plain badge icon,
    // same as its own feature list says ("Trust Badge", not a frame).
  },
  {
    id: "business",
    badge: "Business Verified",
    price: 399,
    features: ["GST / registration confirmed", "Verified Trust Badge on Profile", "Priority Algorithm Matching"],
    icon: Building2,
    // "Company Verified — Minimalist Pro": the real frosted-glass ring
    // already live on every verified business's avatar today.
    frameVariant: "glass",
  },
  {
    id: "full-trust",
    // The one tier that actually grants the real glowing avatar ring (see
    // utils/verification.js's verifiedRingClass) — named "Frame" here to
    // match what it really unlocks, not "Badge" like the three cheaper
    // tiers above it, which genuinely only grant a profile badge icon.
    badge: "Full Trust Frame",
    price: 699,
    features: ["Manual ID & background check", "Gold Trust Frame on avatar", "Top-priority Algorithm Matching"],
    icon: BadgeCheck,
    elite: true,
    // "Elite — Gold Standard": preview only — no per-user "bought full
    // trust" flag exists yet, so this gold ring never renders on a live
    // avatar, only shown here as what purchasing it would unlock.
    frameVariant: "gold",
  },
];

// A small live preview of the exact ring a verified avatar gets — reuses
// the same verifiedRingClass() helper the real dashboards/profile/sidebar
// avatars already render with, so this preview never drifts out of sync
// with what verification actually looks like in the app.
function FramePreviewSwatch({ variant, tone }) {
  return (
    <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ${verifiedRingClass(true, "md", variant)}`}>
      <User className={`h-6 w-6 ${tone}`} />
    </span>
  );
}

// Shared between WorkerWallet.jsx's Subscription tab and the business
// Billing tab (SettingsPage.jsx). A real, paid B2B trust purchase, so it
// keeps its own high-contrast "vault" palette (emerald/gold accents on a
// crisp card) rather than the playful gamification colors used elsewhere —
// but the card itself now follows the app's light/dark theme like every
// other card on these pages, instead of being forced dark regardless of
// the user's actual theme choice. No payment gateway is wired up yet (see
// the subscription tiers' own disclaimer), so every CTA here is honestly
// disabled rather than pretending to start a real checkout.
export default function VerificationFeesTable() {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-[#0A1128]">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Enterprise Verification Badges
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">One-time, paid badges that build real trust on your profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {VERIFICATION_TIERS.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.id}
              className={`flex flex-col rounded-xl border p-6 ${
                row.elite
                  ? "border-amber-300 bg-gradient-to-b from-amber-50 via-white to-white dark:border-amber-400/30 dark:from-amber-500/10 dark:via-[#0F1B3D] dark:to-[#0F1B3D]"
                  : "border-slate-200 bg-slate-50/50 dark:border-slate-700/80 dark:bg-[#0F1B3D]"
              }`}
            >
              {row.frameVariant ? (
                <FramePreviewSwatch
                  variant={row.frameVariant}
                  tone={row.elite ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-300"}
                />
              ) : (
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Icon className="h-5 w-5" />
                </span>
              )}

              <p className="text-base font-bold text-slate-900 dark:text-white">{row.badge}</p>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {row.price === 0 ? row.priceLabel : `₹${row.price}`}
                </span>
                {row.price > 0 && <span className="text-xs font-medium text-slate-400 dark:text-slate-500">one-time</span>}
              </div>
              {row.subLabel && <p className="mt-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{row.subLabel}</p>}

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {row.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <BadgeCheck className={`mt-0.5 h-4 w-4 flex-shrink-0 ${row.elite ? "text-amber-500 dark:text-amber-400" : "text-emerald-500 dark:text-emerald-400"}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled
                title="Payment checkout is coming soon"
                className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#FF6B35]/50 py-3 text-sm font-bold text-white/80"
              >
                <Lock className="h-3.5 w-3.5" />
                {row.price === 0 ? "Claim — Free" : `Purchase — ₹${row.price}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
        Checkout isn't live yet — this is a preview of pricing and what each badge unlocks.
      </p>
    </div>
  );
}
