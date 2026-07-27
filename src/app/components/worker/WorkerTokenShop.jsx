import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, AlertTriangle, Award, Coins, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { getLedger } from "../../lib/gamificationApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/apiClient";

// Token balance shown here is real (the same Ledger this page spends
// from), and the insufficient-balance check against a selected tier is
// real too. The perks themselves stay a visual preview — none of Gold
// Highlight / Momentum Shield / Skill Bridge Profile Audit have a real
// effect wired into the actual proposal-ranking or matching logic yet, so
// "Purchase" resolves to an honest "Coming soon" (when affordable) rather
// than deducting real tokens for an effect that doesn't exist. Same
// precedent as WorkerSubscriptionsPage.jsx.
const PERKS = [
  {
    id: "gold-highlight",
    name: "Gold Highlight",
    description: "Boost your next proposal's visibility to businesses.",
    icon: Award,
    color: "amber",
    tiers: [
      { label: "24-Hour Express", cost: 10 },
      { label: "3-Day Featured", cost: 25 },
      { label: "7-Day Dominance", cost: 50 },
    ],
  },
  {
    id: "momentum-shield",
    name: "Momentum Shield",
    description: "Absorbs one late-delivery penalty on your streak.",
    icon: ShieldCheck,
    color: "teal",
    tiers: [
      { label: "Single-Use Pass", cost: 15 },
      { label: "7-Day Active Shield", cost: 40 },
    ],
  },
  {
    id: "profile-audit",
    name: "Skill Bridge Profile Audit",
    description: "A professional review of your resume and portfolio.",
    icon: Sparkles,
    color: "slate",
    tiers: [{ label: "One-Time Review", cost: 50 }],
  },
];

const COLOR_STYLES = {
  amber: "bg-amber-50 text-amber-600",
  teal: "bg-teal-50 text-teal-600",
  slate: "bg-slate-100 text-slate-600",
};

function PerkCard({ perk, balance, onPurchase, index }) {
  const [tierIndex, setTierIndex] = useState(0);
  const Icon = perk.icon;
  const tier = perk.tiers[tierIndex];
  const canAfford = balance >= tier.cost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${COLOR_STYLES[perk.color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-bold text-[#0A1128]">{perk.name}</p>
      <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{perk.description}</p>

      {perk.tiers.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {perk.tiers.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTierIndex(i)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
                i === tierIndex ? "bg-[#0A1128] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 flex items-center gap-1 text-sm font-black text-[#0A1128]">
        <Coins className="h-3.5 w-3.5 text-amber-500" />
        {tier.cost}
        {perk.tiers.length === 1 && <span className="ml-1 text-xs font-semibold text-slate-400">{tier.label}</span>}
      </p>

      {!canAfford && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-red-500">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          Not enough tokens for this tier
        </p>
      )}

      <button
        onClick={() => onPurchase(perk, tier, canAfford)}
        className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 active:scale-95"
      >
        Purchase
      </button>
    </motion.div>
  );
}

export default function WorkerTokenShop() {
  useDocumentTitle("Token Shop — WorkBridge");
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

  const handlePurchase = (perk, tier, canAfford) => {
    if (!canAfford) {
      setNotice(`You need ${tier.cost} tokens for ${perk.name} (${tier.label}) — you have ${balance}.`);
      return;
    }
    setNotice(`${perk.name} (${tier.label}) isn't redeemable yet — coming soon.`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Token Shop
          </h1>
          <p className="mt-1 text-sm text-slate-500">Spend Bridge Tokens on visibility perks.</p>
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
        {PERKS.map((perk, index) => (
          <PerkCard key={perk.id} perk={perk} balance={balance} onPurchase={handlePurchase} index={index} />
        ))}
      </div>
      <p className="mt-6 text-center text-[11px] text-slate-400">
        Your token balance is real — these perks aren't redeemable yet, this is a preview of what's coming.
      </p>
    </div>
  );
}
