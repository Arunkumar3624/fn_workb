import { Award, BadgeCheck, Building2, Lock, ShieldCheck } from "lucide-react";

const VERIFICATION_TIERS = [
  {
    id: "worker-id",
    badge: "Worker ID Verified",
    price: 0,
    priceLabel: "Free",
    subLabel: "Launch offer — normally ₹199",
    features: ["Aadhaar / ID checked", "Verified Trust Badge on Profile"],
    icon: ShieldCheck,
  },
  {
    id: "skill",
    badge: "Skill Verified",
    price: 299,
    features: ["Skill test passed", "Verified Trust Badge on Profile", "Priority Algorithm Matching"],
    icon: Award,
  },
  {
    id: "business",
    badge: "Business Verified",
    price: 399,
    features: ["GST / registration confirmed", "Verified Trust Badge on Profile", "Priority Algorithm Matching"],
    icon: Building2,
  },
  {
    id: "full-trust",
    badge: "Full Trust Badge",
    price: 699,
    features: ["Manual ID & background check", "Gold Trust Frame on avatar", "Top-priority Algorithm Matching"],
    icon: BadgeCheck,
    elite: true,
  },
];

// Shared between WorkerWallet.jsx's Subscription tab and the business
// Billing tab (SettingsPage.jsx). Deliberately not styled like the gamified
// Tokens/Perks Shop next to it — this is a paid B2B trust purchase, so it
// gets its own high-contrast "vault" treatment (deep navy / emerald / gold)
// instead of the playful orange-and-amber gamification palette used
// elsewhere on this page. No payment gateway is wired up yet (see the
// subscription tiers' own disclaimer), so every CTA here is honestly
// disabled rather than pretending to start a real checkout.
export default function VerificationFeesTable() {
  return (
    <div className="mt-8 rounded-2xl border border-slate-800 bg-[#0A1128] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.25)] sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Enterprise Verification Badges
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">One-time, paid badges that build real trust on your profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {VERIFICATION_TIERS.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.id}
              className={`flex flex-col rounded-xl border p-5 ${
                row.elite
                  ? "border-amber-400/30 bg-gradient-to-b from-amber-500/10 via-[#0F1B3D] to-[#0F1B3D]"
                  : "border-slate-700/80 bg-[#0F1B3D]"
              }`}
            >
              <span
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${
                  row.elite ? "bg-amber-400/15 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>

              <p className="text-sm font-bold text-white">{row.badge}</p>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white">
                  {row.price === 0 ? row.priceLabel : `₹${row.price}`}
                </span>
                {row.price > 0 && <span className="text-xs font-medium text-slate-500">one-time</span>}
              </div>
              {row.subLabel && <p className="mt-0.5 text-xs text-emerald-400">{row.subLabel}</p>}

              <ul className="mt-4 flex flex-1 flex-col gap-2">
                {row.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-slate-300">
                    <BadgeCheck className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${row.elite ? "text-amber-400" : "text-emerald-400"}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled
                title="Payment checkout is coming soon"
                className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#FF6B35]/50 py-2.5 text-xs font-bold text-white/80"
              >
                <Lock className="h-3.5 w-3.5" />
                {row.price === 0 ? "Claim — Free" : `Purchase — ₹${row.price}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[11px] text-slate-500">
        Checkout isn't live yet — this is a preview of pricing and what each badge unlocks.
      </p>
    </div>
  );
}
