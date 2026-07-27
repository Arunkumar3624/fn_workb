import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Check, Crown, Loader2, ShieldCheck, Star, Zap } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

// Real payment/subscriptions are deliberately deferred (pending an
// escrow-partner decision) — this is a visual preview, same precedent as
// BusinessVerificationDrawer/CelebrationOverlay and SettingsPage's Billing
// tab. "Upgrade Now" resolves to an honest "Coming soon" state rather than
// pretending a subscription was purchased — the loading spinner is real
// interaction feedback, not a fake success.
const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "/mo",
    perks: ["Standard job matching", "10 proposals/week", "Standard platform commission"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹299",
    period: "/mo",
    highlight: true,
    perks: [
      "Priority placement in business applicant lists",
      "Profile analytics graph",
      "Reduced platform commission",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: "₹599",
    period: "/mo",
    premium: true,
    perks: [
      "Top placement in the Find Workers directory",
      "Priority instant verification badge",
      "Zero commission on your first ₹10,000 earned each month",
    ],
  },
];

const TIER_ICONS = { free: ShieldCheck, pro: BarChart3, elite: Crown };

function TierCard({ tier, isUpgrading, upgradeResult, onUpgrade }) {
  const Icon = TIER_ICONS[tier.id];
  const isFree = tier.id === "free";

  const cardCls = tier.premium
    ? "bg-[#0F172A] text-white border border-white/10"
    : tier.highlight
    ? "bg-white border-2 border-[#FF6B35]"
    : "bg-white border border-slate-200";

  return (
    <div className={`relative flex flex-col rounded-3xl p-7 shadow-sm ${cardCls}`}>
      {tier.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FF6B35] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
          Most Popular
        </span>
      )}

      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tier.premium ? "bg-white/10" : "bg-slate-100"}`}>
        <Icon className={`h-5 w-5 ${tier.premium ? "text-[#FF6B35]" : "text-[#1B3FAB]"}`} />
      </div>

      <p className={`mt-4 text-sm font-bold uppercase tracking-wide ${tier.premium ? "text-slate-300" : "text-slate-400"}`}>
        {tier.name}
      </p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-black">{tier.price}</span>
        <span className={tier.premium ? "text-sm text-slate-400" : "text-sm text-slate-400"}>{tier.period}</span>
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm leading-6">
            <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${tier.premium ? "text-[#FF6B35]" : "text-emerald-500"}`} />
            <span className={tier.premium ? "text-slate-200" : "text-slate-600"}>{perk}</span>
          </li>
        ))}
      </ul>

      {isFree ? (
        <button
          disabled
          className={`mt-7 w-full cursor-default rounded-xl py-3 text-sm font-bold ${
            tier.premium ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500"
          }`}
        >
          Current Plan
        </button>
      ) : upgradeResult === tier.id ? (
        <p className="mt-7 rounded-xl border border-dashed border-slate-300 py-3 text-center text-xs font-semibold text-slate-400">
          Coming soon — payment isn't wired up yet.
        </p>
      ) : (
        <button
          onClick={() => onUpgrade(tier.id)}
          disabled={isUpgrading === tier.id}
          className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-300 disabled:opacity-70 ${
            tier.premium
              ? "bg-[#FF6B35] text-white shadow-[0_0_25px_-5px_rgba(255,107,53,0.6)] hover:-translate-y-0.5 hover:bg-[#e85d27]"
              : "bg-[#0F172A] text-white hover:-translate-y-0.5 hover:bg-[#1a2547]"
          }`}
        >
          {isUpgrading === tier.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Upgrade Now
        </button>
      )}
    </div>
  );
}

export default function WorkerSubscriptionsPage() {
  useDocumentTitle("Subscriptions — WorkBridge");
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(null);
  const [upgradeResult, setUpgradeResult] = useState(null);

  const handleUpgrade = (tierId) => {
    setIsUpgrading(tierId);
    setUpgradeResult(null);
    setTimeout(() => {
      setIsUpgrading(null);
      setUpgradeResult(tierId);
    }, 900);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#0F172A]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="mb-10 text-center">
        <div className="mx-auto flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
          <Star className="h-3.5 w-3.5 fill-current" />
          Subscriptions
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-[#0F172A] sm:text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Grow faster on WorkBridge
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Pick a plan that gets you seen first — real billing is on its way, this is a preview of what's coming.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {TIERS.map((tier) => (
          <TierCard key={tier.id} tier={tier} isUpgrading={isUpgrading} upgradeResult={upgradeResult} onUpgrade={handleUpgrade} />
        ))}
      </div>
    </div>
  );
}
