import { useEffect, useState } from "react";
import { TrendingUp, Lock, Wallet, Zap, Crown, ShieldCheck, Ticket, AlertCircle, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import LockedCurrencyInput from "../common/LockedCurrencyInput";
import { positiveCurrencySchema } from "../../utils/formValidation";
import { useAuth } from "../../context/AuthContext";
import { getWallet, withdraw } from "../../lib/walletApi";
import { listProjects } from "../../lib/projectsApi";
import { ApiError } from "../../lib/apiClient";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

const IN_ESCROW_STATUSES = new Set(["FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED"]);

const withdrawalSchema = z.object({
  amount: positiveCurrencySchema,
  destination: z.string().min(2),
});

export default function WorkerWallet() {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [heldSecurely, setHeldSecurely] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadWallet = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [walletData, projects] = await Promise.all([getWallet(), listProjects({ role: "worker" })]);
      setWallet(walletData);
      setHeldSecurely(
        projects
          .filter((p) => IN_ESCROW_STATUSES.has(p.status))
          .reduce((sum, p) => sum + Number(p.budget), 0)
      );
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Could not load your wallet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const totalEarned = (wallet?.transactions ?? [])
    .filter((t) => t.type === "PAYOUT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      destination: "Primary Bank Account",
    },
  });

  const onSubmit = async (formData) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await withdraw({ amount: formData.amount, destination: formData.destination });
      reset({ amount: "", destination: formData.destination });
      await loadWallet();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Withdrawal failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-7">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-7">
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-[#eef2ff] via-[#f8fafc] to-[#fff3ec] p-4 pb-12 sm:p-7 wb-tab-enter">
      <div className="pointer-events-none absolute -top-20 -left-16 -z-10 h-72 w-72 rounded-full bg-[#1B3FAB]/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-40 -right-20 -z-10 h-72 w-72 rounded-full bg-[#FF6B35]/10 blur-[100px]" />
      <h1
        className="text-xl font-extrabold text-[#0A1128] mb-6"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        My Wallet
      </h1>

      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
        {[
          {
            label: "Total Earned",
            value: formatINR(totalEarned),
            icon: TrendingUp,
            col: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
          {
            label: "Held Securely",
            value: formatINR(heldSecurely),
            icon: Lock,
            col: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
          },
          {
            label: "Ready to Cash Out",
            value: formatINR(wallet?.balance),
            icon: Wallet,
            col: "text-[#1B3FAB]",
            bg: "bg-[#1B3FAB]/5",
            border: "border-[#1B3FAB]/10",
          },
        ].map(({ label, value, icon: I, col, bg, border }, i) => (
          <div
            key={label}
            className={`bg-white/60 backdrop-blur-xl rounded-2xl border ${border} shadow-lg shadow-slate-200/40 p-5 wb-stat-card wb-card-enter`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <I className={`w-5 h-5 ${col}`} />
            </div>
            <div
              className={`text-2xl font-extrabold ${col}`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {value}
            </div>
            <div className="text-slate-500 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 shadow-lg shadow-slate-200/40 p-5 wb-card-enter" style={{ animationDelay: "240ms" }}>
          <h3 className="font-bold text-slate-800 mb-4">Cash Out in 60 Seconds</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {submitError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Amount</label>
              <LockedCurrencyInput
                value={watch("amount")}
                onChange={(value) => setValue("amount", value, { shouldValidate: true })}
                placeholder="10000"
                inputClassName="w-full px-4 py-2.5 bg-[#F4F6FF] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20"
              />
              {errors.amount && <p className="mt-1 text-xs font-semibold text-red-500">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Withdraw to</label>
              <select {...register("destination")} className="w-full px-4 py-2.5 bg-[#F4F6FF] border border-slate-200 rounded-xl text-sm focus:outline-none">
                <option>Primary Bank Account</option>
                <option>Google Pay UPI</option>
                <option>PhonePe UPI</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] py-3 bg-[#1B3FAB] text-white rounded-xl text-sm font-bold hover:bg-[#1635A0] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#1B3FAB]/20 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <Zap className="w-4 h-4" />{submitting ? "Processing…" : "Withdraw in 60 Seconds"}
            </button>
            <p className="text-xs text-slate-400 text-center">7% platform commission already deducted from earnings</p>
          </form>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 shadow-lg shadow-slate-200/40 p-5 wb-card-enter" style={{ animationDelay: "320ms" }}>
          <h3 className="font-bold text-slate-800 mb-4">Transaction History</h3>
          {(wallet?.transactions ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {wallet.transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50/50 transition-colors rounded-lg px-1 -mx-1">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-700 truncate">{t.reference_note ?? t.type}</div>
                    <div
                      className="text-xs text-slate-400 mt-0.5"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {new Date(t.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <div className={`flex-shrink-0 text-sm font-bold ${t.direction === "credit" ? "text-emerald-600" : "text-slate-500"}`}>
                    {t.direction === "credit" ? "+" : "–"}{formatINR(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Subscription tiers ── */}
      <SubscriptionTierGrid behaviorScore={currentUser?.behavior_score ?? 0} />
    </div>
  );
}

const GOOD_STANDING = 600;

const TIERS = [
  {
    id: "basic",
    name: "Basic",
    tagline: "For getting started",
    price: "₹0",
    period: "/forever",
    icon: Wallet,
    features: [
      "Apply to jobs via the skill quiz path",
      "Standard visibility in the job feed",
      "Community support",
    ],
    cta: "Current Plan",
    accent: {
      border: "border-slate-200",
      card: "bg-white/50",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-500",
      button: "bg-slate-100 text-slate-400 cursor-not-allowed",
      priceColor: "text-slate-900",
    },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For consistent freelancers",
    price: "₹299",
    period: "/mo",
    icon: Ticket,
    badge: "Most Popular",
    features: [
      "5 penalty-free applies / month",
      "Featured badge on proposals",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    accent: {
      border: "border-[#FF6B35]/40",
      card: "bg-gradient-to-br from-orange-50/60 via-white/50 to-white/50",
      iconBg: "bg-[#FF6B35]/10",
      iconColor: "text-[#FF6B35]",
      button: "bg-[#FF6B35] text-white hover:bg-[#e55a2b] shadow-lg shadow-orange-200",
      priceColor: "text-slate-900",
    },
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Risk-free visibility, Good Standing only",
    price: "₹599",
    period: "/mo",
    icon: Crown,
    features: [
      "First Job Promise — land nothing in 10 applies? Next month's free.",
      "10 penalty-free applies / month",
      "Fully expanded proposals with the glowing Elite badge",
    ],
    cta: "Upgrade to Elite",
    accent: {
      border: "border-amber-300/60",
      card: "bg-gradient-to-br from-amber-50/70 via-white/50 to-white/50",
      iconBg: "bg-gradient-to-br from-amber-400 to-amber-500",
      iconColor: "text-white",
      button: "bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:shadow-xl shadow-lg shadow-amber-200",
      priceColor: "text-slate-900",
    },
    gated: true,
  },
];

function SubscriptionTierGrid({ behaviorScore }) {
  const inGoodStanding = behaviorScore >= GOOD_STANDING;
  const scorePct = Math.min(100, (behaviorScore / 1000) * 100);

  return (
    <div className="mt-8 wb-card-enter" style={{ animationDelay: "400ms" }}>
      <div className="mb-5 text-center">
        <h2 className="text-lg font-extrabold text-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          WorkBridge Plans
        </h2>
        <p className="mt-1 text-sm text-slate-500">Boost your visibility as you build trust on the platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const isElite = tier.id === "elite";
          const eliteLocked = isElite && !inGoodStanding;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col overflow-hidden rounded-2xl border ${tier.accent.border} ${tier.accent.card} backdrop-blur-xl shadow-lg shadow-slate-200/40 p-6`}
            >
              {tier.badge && (
                <span className="absolute right-5 top-5 rounded-full bg-[#FF6B35] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {tier.badge}
                </span>
              )}

              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tier.accent.iconBg} ${tier.accent.iconColor}`}>
                <Icon className="h-5 w-5" />
              </span>

              <h3 className="mt-4 text-lg font-extrabold text-[#0F172A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {tier.name}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">{tier.tagline}</p>

              <p className={`mt-4 text-3xl font-extrabold ${tier.accent.priceColor}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {tier.price}
                <span className="text-sm font-semibold text-slate-400">{tier.period}</span>
              </p>

              <ul className="mt-5 flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3 w-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {isElite && (
                <div className="mt-5 rounded-xl border border-white/70 bg-white/50 backdrop-blur-md p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <ShieldCheck className={`h-3.5 w-3.5 ${inGoodStanding ? "text-emerald-500" : "text-rose-500"}`} />
                      Score: {behaviorScore} / 1000
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${inGoodStanding ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                      {inGoodStanding ? "Eligible" : "Below 600"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${inGoodStanding ? "bg-emerald-500" : "bg-rose-400"}`}
                      style={{ width: `${scorePct}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                disabled={tier.id === "basic" || eliteLocked}
                className={`mt-6 min-h-[44px] w-full rounded-xl py-3 text-sm font-black transition-all duration-300 hover:-translate-y-0.5 disabled:hover:translate-y-0 ${
                  eliteLocked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : tier.accent.button
                }`}
              >
                {eliteLocked ? "Reach 600 to unlock" : tier.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
