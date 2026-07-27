import { useEffect, useState } from "react";
import { AlertCircle, Coins, Loader2, Radar, Search, Zap } from "lucide-react";
import { getLedger } from "../../lib/gamificationApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/apiClient";

// Corporate Credits balance shown here is real (earned on completing a
// project with no dispute — see projects.controller.js's completeProject).
// The perks themselves are a visual preview, same precedent as
// WorkerTokenShop.jsx — none of these have a real effect wired into the
// job-feed ranking or worker-matching logic yet, so "Purchase" resolves to
// an honest "Coming soon" rather than faking one.
const PERKS = [
  {
    id: "flash-post",
    name: "Flash Post",
    description: "Boost your next job post's visibility in the Job Feed.",
    cost: 30,
    icon: Zap,
    color: "teal",
  },
  {
    id: "ai-shortlist",
    name: "AI Shortlist",
    description: "Curated top-3 worker recommendations for your post.",
    cost: 60,
    icon: Search,
    color: "slate",
  },
  {
    id: "enterprise-broadcast",
    name: "Enterprise Broadcast",
    description: "Direct notification to elite, top-tier talent.",
    cost: 120,
    icon: Radar,
    color: "amber",
  },
];

const COLOR_STYLES = {
  teal: "bg-teal-50 text-teal-600",
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-50 text-amber-600",
};

export default function BusinessPerksShop() {
  useDocumentTitle("Business Perks — WorkBridge");
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getLedger()
      .then((data) => {
        if (!cancelled) setBalance(data.bridgeTokens);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your balance.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Business Perks Shop
          </h1>
          <p className="mt-1 text-sm text-slate-500">Spend Corporate Credits to boost your hiring.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0A1128]">
          <Coins className="h-4 w-4 text-amber-500" />
          {balance}
        </div>
      </div>

      {notice && (
        <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PERKS.map((perk) => {
          const Icon = perk.icon;
          return (
            <div key={perk.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${COLOR_STYLES[perk.color]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-bold text-[#0A1128]">{perk.name}</p>
              <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{perk.description}</p>
              <p className="mt-3 flex items-center gap-1 text-sm font-black text-[#0A1128]">
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                {perk.cost}
              </p>
              <button
                onClick={() => setNotice(`${perk.name} isn't redeemable yet — coming soon.`)}
                className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
              >
                Purchase
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-[11px] text-slate-400">
        Your credit balance is real (earned when a project closes with no dispute) — these perks aren't
        redeemable yet, this is a preview of what's coming.
      </p>
    </div>
  );
}
