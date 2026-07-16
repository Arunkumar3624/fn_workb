import { useEffect, useState } from "react";
import { TrendingUp, Lock, Wallet, Zap, Crown, ShieldCheck, Gift, Ticket, Megaphone, AlertCircle } from "lucide-react";
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
    <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden p-4 pb-12 sm:p-7 wb-tab-enter">
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
            className={`bg-white rounded-2xl border ${border} p-5 wb-stat-card wb-card-enter`}
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
        <div className="wb-dash-card rounded-2xl p-5 wb-card-enter" style={{ animationDelay: "240ms" }}>
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

        <div className="wb-dash-card rounded-2xl p-5 wb-card-enter" style={{ animationDelay: "320ms" }}>
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

      {/* ── WorkBridge Elite — ROI Guarantee ── */}
      <EliteUpsellCard behaviorScore={currentUser?.behavior_score ?? 0} />
    </div>
  );
}

const GOOD_STANDING = 600;

const ELITE_PERKS = [
  {
    Icon: Gift,
    title: "First Job Promise",
    text: "Keep a 100% complete profile and apply to 10 jobs in a month. Land nothing? Your next month is free.",
  },
  {
    Icon: Ticket,
    title: "10 penalty-free applies / month",
    text: "Direct Apply without the 15-point deduction — more shots at landing work, zero score risk.",
  },
  {
    Icon: Megaphone,
    title: "Featured proposals",
    text: "Your pitch shows fully expanded to clients, with the glowing Elite badge on every card.",
  },
];

function EliteUpsellCard({ behaviorScore }) {
  const inGoodStanding = behaviorScore >= GOOD_STANDING;
  const scorePct = Math.min(100, (behaviorScore / 1000) * 100);

  return (
    <div
      className="relative mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/90 via-white to-white p-6 wb-card-enter"
      style={{ animationDelay: "400ms" }}
    >
      {/* soft gold glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-[0_0_24px_rgba(251,191,36,0.5)]">
            <Crown className="h-5 w-5" />
          </span>
          <div>
            <h3
              className="text-lg font-extrabold text-[#0F172A]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              WorkBridge Elite
            </h3>
            <p className="text-xs text-slate-500">Risk-free visibility for freelancers in Good Standing</p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-xl font-extrabold text-[#0F172A]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            ₹499<span className="text-sm font-semibold text-slate-400">/mo</span>
          </p>
          <p className="text-[11px] text-slate-400">Cancel anytime</p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 md:grid-cols-3">
        {ELITE_PERKS.map(({ Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-amber-100 bg-white/80 p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-2.5 text-sm font-bold text-slate-800">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
          </div>
        ))}
      </div>

      {/* Eligibility — Elite visibility pauses if the score drops below 600 */}
      <div className="relative mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <ShieldCheck className={`h-4 w-4 ${inGoodStanding ? "text-emerald-500" : "text-rose-500"}`} />
            Your Behavior Score: {behaviorScore} / 1000
          </p>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              inGoodStanding ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
            }`}
          >
            {inGoodStanding ? "✓ Good Standing — eligible for Elite" : "Below 600 — Elite visibility paused"}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${inGoodStanding ? "bg-emerald-500" : "bg-rose-400"}`}
            style={{ width: `${scorePct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] leading-4 text-slate-400">
          Elite never buys ranking — it boosts visibility only while your score stays above {GOOD_STANDING}.
          Late deliveries or poor ratings pause the boost until you recover.
        </p>
      </div>

      <button
        className="relative mt-5 min-h-[44px] w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-sm font-black text-white shadow-lg shadow-amber-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      >
        Upgrade to Elite — start the First Job Promise
      </button>
    </div>
  );
}
