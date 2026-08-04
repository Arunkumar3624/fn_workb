import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, AlertTriangle, Coins, Loader2, Radar, Search, Zap } from "lucide-react";
import { getLedger } from "../../lib/gamificationApi";
import { purchasePerk, getPerkPurchases } from "../../lib/perksApi";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/apiClient";

// Corporate Credits balance shown here is real (earned on completing a
// project with no dispute — see projects.controller.js's completeProject),
// and "Purchase" is real too — it debits the balance and persists a
// redemption row via perks.controller.js (server resolves cost from
// perksCatalog.js, never trusts the tier.cost shown here). Tier `id`s must
// match perksCatalog.js exactly. What's still a preview: none of these
// perks have a real effect wired into the job-feed ranking or
// worker-matching logic yet (MASTER_ECONOMY_PLAN.md Phase 3's slot-cap
// logic) — same precedent as WorkerTokenShop.jsx.
const PERKS = [
  {
    id: "flash-post",
    name: "Flash Post",
    description: "Boost your next job post's visibility in the Job Feed.",
    icon: Zap,
    color: "teal",
    tiers: [
      { id: "24h-express", label: "24-Hour Express", cost: 15 },
      { id: "3d-featured", label: "3-Day Featured", cost: 35 },
      { id: "7d-dominance", label: "7-Day Dominance", cost: 70 },
    ],
  },
  {
    id: "ai-shortlist",
    name: "AI Shortlist",
    description: "Curated top-3 worker recommendations for your post.",
    icon: Search,
    color: "slate",
    tiers: [
      { id: "single-use", label: "Single-Use Pass", cost: 35 },
      { id: "7d-active", label: "7-Day Active", cost: 90 },
    ],
  },
  {
    id: "enterprise-broadcast",
    name: "Enterprise Broadcast",
    description: "Direct notification to elite, top-tier talent.",
    icon: Radar,
    color: "amber",
    tiers: [{ id: "one-time", label: "One-Time Broadcast", cost: 120 }],
  },
];

const COLOR_STYLES = {
  teal: "bg-teal-50 text-teal-600",
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-50 text-amber-600",
};

function PerkCard({ perk, balance, onPurchase, index, isPurchasing, purchaseDisabled }) {
  const [tierIndex, setTierIndex] = useState(0);
  const Icon = perk.icon;
  const tier = perk.tiers[tierIndex];
  const canAfford = balance >= tier.cost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-slate-300/40"
    >
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        aria-hidden="true"
      />

      <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${COLOR_STYLES[perk.color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="relative mt-3 text-sm font-bold text-[#0A1128]">{perk.name}</p>
      <p className="relative mt-1 flex-1 text-xs leading-5 text-slate-500">{perk.description}</p>

      {perk.tiers.length > 1 && (
        <div className="relative mt-3 flex flex-wrap gap-1.5">
          {perk.tiers.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTierIndex(i)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all duration-200 ${
                i === tierIndex ? "bg-[#0A1128] text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <motion.p
        key={tier.cost}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative mt-3 flex items-center gap-1 text-sm font-black text-[#0A1128]"
      >
        <Coins className="h-3.5 w-3.5 text-amber-500" />
        {tier.cost}
        {perk.tiers.length === 1 && <span className="ml-1 text-xs font-semibold text-slate-400">{tier.label}</span>}
      </motion.p>

      {!canAfford && (
        <p className="relative mt-2 flex items-center gap-1 text-[11px] font-semibold text-red-500">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          Not enough credits for this tier
        </p>
      )}

      <button
        onClick={() => onPurchase(perk, tier, canAfford)}
        disabled={purchaseDisabled}
        className={`relative mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
          canAfford
            ? "border-slate-200 text-slate-500 hover:bg-slate-50"
            : "border-slate-100 text-slate-300 opacity-50 hover:bg-transparent"
        } ${purchaseDisabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        {isPurchasing && <Loader2 className="h-3 w-3 animate-spin" />}
        {isPurchasing ? "Purchasing…" : "Purchase"}
      </button>
    </motion.div>
  );
}

export default function BusinessPerksShop() {
  useDocumentTitle("Business Perks — WorkBridge");
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [purchasingPerkId, setPurchasingPerkId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getLedger(), getPerkPurchases()])
      .then(([ledger, purchaseHistory]) => {
        if (cancelled) return;
        setBalance(ledger.bridgeTokens);
        setPurchases(purchaseHistory);
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

  const handlePurchase = async (perk, tier, canAfford) => {
    if (!canAfford) {
      setNotice(`You need ${tier.cost} credits for ${perk.name} (${tier.label}) — you have ${balance}.`);
      return;
    }
    setNotice(null);
    setPurchasingPerkId(perk.id);
    try {
      const result = await purchasePerk({ perkId: perk.id, tierId: tier.id });
      setBalance(result.bridgeTokens);
      setPurchases((prev) => [result.purchase, ...prev]);
      setNotice(`Purchased ${perk.name} (${tier.label}) — ${tier.cost} credits debited.`);
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : "Purchase failed — try again.");
    } finally {
      setPurchasingPerkId(null);
    }
  };

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
        {PERKS.map((perk, index) => (
          <PerkCard
            key={perk.id}
            perk={perk}
            balance={balance}
            onPurchase={handlePurchase}
            index={index}
            isPurchasing={purchasingPerkId === perk.id}
            purchaseDisabled={purchasingPerkId !== null}
          />
        ))}
      </div>

      {purchases.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Recent Purchases</p>
          <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
            {purchases.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-slate-700">{p.label}</span>
                <span className="flex items-center gap-1 font-semibold text-slate-500">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  {p.token_cost}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-[11px] text-slate-400">
        Your credit balance is real (earned when a project closes with no dispute), and purchases here really
        debit it and are recorded — the visibility boost itself isn't wired into job-feed ranking yet.
      </p>
    </div>
  );
}
