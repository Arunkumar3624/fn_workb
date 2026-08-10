import { Award, Building2, ShieldCheck } from "lucide-react";

const VERIFICATION_FEES = [
  {
    id: "worker-id",
    badge: "Worker ID Verified",
    fee: "Free (launch offer, normally ₹199)",
    provides: "Aadhaar / ID checked",
    icon: ShieldCheck,
    tone: "emerald",
  },
  {
    id: "skill",
    badge: "Skill Verified",
    fee: "₹299 (one-time)",
    provides: "Skill test passed",
    icon: Award,
    tone: "blue",
  },
  {
    id: "business",
    badge: "Business Verified",
    fee: "₹399 (one-time)",
    provides: "GST / registration confirmed",
    icon: Building2,
    tone: "violet",
  },
  {
    id: "full-trust",
    badge: "Full Trust Badge",
    fee: "₹699 (one-time)",
    provides: "Complete background check",
    // Gets a decorative avatar-frame swatch instead of a plain badge icon —
    // a small preview of the real ring a fully-verified profile's avatar
    // gets, so this one row visibly reads as "your whole profile gets
    // dressed up," not just another checkmark like the three rows above it.
    frame: true,
  },
];

function TrustFrameSwatch() {
  return (
    <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-[2.5px]">
        <span className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-slate-900">
          <span className="h-3 w-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
        </span>
      </span>
    </span>
  );
}

const TONE_CLASSES = {
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
};

// Shared between WorkerWallet.jsx's Subscription tab and the business
// Billing tab (SettingsPage.jsx) — the same one-time verification badges
// apply to both sides, unfiltered by role, same as the reference pricing
// sheet this was built from. Real prices, not yet a live charge — same
// "preview" honesty disclaimer as the subscription tiers next to it, since
// there's no payment gateway wired up yet.
export default function VerificationFeesTable() {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold text-[#0A1128] dark:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Verification Fees
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">One-time badges that build trust on your profile.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Badge</th>
              <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Fee</th>
              <th className="pb-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">What It Provides</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {VERIFICATION_FEES.map((row) => {
              const Icon = row.icon;
              return (
                <tr key={row.id}>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      {row.frame ? (
                        <TrustFrameSwatch />
                      ) : (
                        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[row.tone]}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      <span className="font-bold text-slate-900 dark:text-white">{row.badge}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-slate-700 dark:text-slate-300">{row.fee}</td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400">{row.provides}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-center text-[11px] text-slate-400 dark:text-slate-500">
        Verification fees aren't live yet — this is a preview of what's coming.
      </p>
    </div>
  );
}
