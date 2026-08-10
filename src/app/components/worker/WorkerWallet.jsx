import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TrendingUp,
  Lock,
  Wallet,
  Zap,
  AlertCircle,
  Loader2,
  Receipt,
  FileText,
  ArrowRight,
  X,
  Clock3,
  BarChart3,
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import LockedCurrencyInput from "../common/LockedCurrencyInput";
import { positiveCurrencySchema } from "../../utils/formValidation";
import { getWallet, withdraw, listWithdrawals } from "../../lib/walletApi";
import { listProjects } from "../../lib/projectsApi";
import { ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

// round2 matches the exact payout math projects.controller.js's
// completeProject uses, so the fee/net shown for invoices always matches
// what's on the real ledger, to the paisa.
function round2(n) {
  return Math.round(n * 100) / 100;
}

const IN_ESCROW_STATUSES = new Set(["FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED"]);

// The former standalone /worker/subscriptions page, now the Wallet's second
// tab (Target 3's consolidation — one place for "everything about your
// money on WorkBridge," not a separate route). "Fairness First" — Elite is
// gated on real behavior_score (adjustBehaviorScore in
// backend/src/repositories/users.repository.js — the same column
// ApplicationQuizModal.jsx's +15/-5 writes to), so a worker with a poor
// track record can't just buy their way to top placement. Real payment/
// subscriptions are still deliberately deferred (pending an escrow-partner
// decision — see backend/schema.sql's platform_fee_pct design notes) —
// "Upgrade Now" resolves to an honest "Coming soon" state rather than
// pretending a subscription was purchased.
const ELITE_GOOD_STANDING = 600;

const SUBSCRIPTION_TIERS = [
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

function SubscriptionTierCard({ tier, isUpgrading, upgradeResult, onUpgrade, behaviorScore }) {
  const Icon = TIER_ICONS[tier.id];
  const isFree = tier.id === "free";
  const isElite = tier.id === "elite";
  const eliteLocked = isElite && behaviorScore < ELITE_GOOD_STANDING;

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
        <span className="text-sm text-slate-400">{tier.period}</span>
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm leading-6">
            <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${tier.premium ? "text-[#FF6B35]" : "text-emerald-500"}`} />
            <span className={tier.premium ? "text-slate-200" : "text-slate-600"}>{perk}</span>
          </li>
        ))}
      </ul>

      {isElite && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <ShieldCheck className={`h-3.5 w-3.5 ${eliteLocked ? "text-rose-400" : "text-emerald-400"}`} />
              Behavior Score: {behaviorScore}/1000
            </p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${eliteLocked ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"}`}>
              {eliteLocked ? `Need ${ELITE_GOOD_STANDING}` : "Eligible"}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-700 ${eliteLocked ? "bg-rose-400" : "bg-emerald-400"}`}
              style={{ width: `${Math.min(100, (behaviorScore / 1000) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {isFree ? (
        <button
          disabled
          className={`mt-7 w-full cursor-default rounded-xl py-3 text-sm font-bold ${
            tier.premium ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500"
          }`}
        >
          Current Plan
        </button>
      ) : eliteLocked ? (
        <button
          disabled
          className="mt-7 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-bold text-slate-400"
        >
          <Lock className="h-4 w-4" />
          Reach {ELITE_GOOD_STANDING} Behavior Score to Unlock
        </button>
      ) : upgradeResult === tier.id ? (
        <p className="mt-7 rounded-xl border border-dashed border-slate-300 py-3 text-center text-xs font-semibold text-slate-400">
          Coming Soon! (We're Still Wiring Up the Payment System)
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

function SubscriptionTab() {
  const { currentUser } = useAuth();
  const behaviorScore = currentUser?.behavior_score ?? 1000;
  const [isUpgrading, setIsUpgrading] = useState(null);
  const [upgradeResult, setUpgradeResult] = useState(null);

  const handleUpgrade = (tierId) => {
    if (tierId === "elite" && behaviorScore < ELITE_GOOD_STANDING) return;
    setIsUpgrading(tierId);
    setUpgradeResult(null);
    setTimeout(() => {
      setIsUpgrading(null);
      setUpgradeResult(tierId);
    }, 900);
  };

  return (
    <div className="rounded-2xl border border-white/70 bg-white/60 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-xl sm:p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#FF6B35]">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          Upgrade Subscription
        </div>
        <h2 className="mt-2 text-2xl font-extrabold text-[#0F172A] sm:text-3xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Grow faster on WorkBridge
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Pick a plan that gets you seen first — real billing is on its way, this is a preview of what's coming.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {SUBSCRIPTION_TIERS.map((tier) => (
          <SubscriptionTierCard
            key={tier.id}
            tier={tier}
            isUpgrading={isUpgrading}
            upgradeResult={upgradeResult}
            onUpgrade={handleUpgrade}
            behaviorScore={behaviorScore}
          />
        ))}
      </div>
    </div>
  );
}

const withdrawalSchema = z.object({
  amount: positiveCurrencySchema,
  payoutMethod: z.enum(["UPI", "BANK_TRANSFER"]),
  payoutDetails: z.string().trim().min(3, "Enter a real UPI ID or bank account so WorkBridge can actually pay you."),
});

const WALLET_TABS = [
  { id: "ledger", label: "Financial Ledger", icon: Wallet },
  { id: "subscription", label: "Upgrade Subscription", icon: Sparkles },
];

export default function WorkerWallet() {
  const navigate = useNavigate();
  // Lets the Growth Ad toast (WorkerDashboard.jsx) link straight to
  // /worker/wallet?tab=subscription instead of always landing on the
  // Ledger and making the worker click again — same convention as
  // EconomyHub.jsx's own ?tab= handling.
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [walletTab, setWalletTab] = useState(WALLET_TABS.some((t) => t.id === requestedTab) ? requestedTab : "ledger");
  const [wallet, setWallet] = useState(null);
  const [heldSecurely, setHeldSecurely] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [activeView, setActiveView] = useState("transactions");

  const loadWallet = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [walletData, projects, completed, withdrawals] = await Promise.all([
        getWallet(),
        listProjects({ role: "worker" }),
        listProjects({ role: "worker", status: "COMPLETED" }),
        listWithdrawals(),
      ]);
      setWallet(walletData);
      setHeldSecurely(
        projects
          .filter((p) => IN_ESCROW_STATUSES.has(p.status))
          .reduce((sum, p) => sum + Number(p.budget), 0)
      );
      setInvoices(completed);
      setPendingWithdrawals(withdrawals.filter((w) => w.status === "PENDING"));
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
      payoutMethod: "UPI",
      payoutDetails: "",
    },
  });

  const onSubmit = async (formData) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await withdraw({ amount: formData.amount, payoutMethod: formData.payoutMethod, payoutDetails: formData.payoutDetails });
      reset({ amount: "", payoutMethod: formData.payoutMethod, payoutDetails: "" });
      setShowWithdrawForm(false);
      await loadWallet();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Withdrawal request failed. Please try again.");
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

      {/* Target 3's consolidation — Upgrade Subscription used to be its own
          /worker/subscriptions route; it's a tab here now, alongside the
          real ledger, so "everything about your money" lives in one place. */}
      <div className="relative mb-6 flex w-fit gap-1.5 rounded-full border border-slate-200 bg-white p-1.5">
        {WALLET_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setWalletTab(id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              walletTab === id ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {walletTab === "subscription" ? (
        <SubscriptionTab />
      ) : (
      <>

      {/* ── Financial Vault ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/50 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-2xl sm:p-8 wb-card-enter">
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#1B3FAB]/10 blur-[80px]" />

        {/* 3-column financial stats: Available (primary, unlocked money) vs
            Pending in Escrow / Lifetime Earned (secondary, informational —
            not spendable yet or already spent) — kept visually distinct so
            the balance a user can actually withdraw is never confused with
            money that's still tied to an active project. */}
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Wallet className="h-3.5 w-3.5 text-[#1B3FAB]" />
              Available to Withdraw
            </p>
            <p
              className="mt-2 text-5xl font-bold tracking-tight text-slate-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {formatINR(wallet?.balance)}
            </p>
          </div>

          <div className="sm:border-l sm:border-slate-200/70 sm:pl-6">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Lock className="h-3.5 w-3.5 text-amber-500" />
              Pending in Escrow
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-700">
              {formatINR(heldSecurely)}
            </p>
          </div>

          <div className="sm:border-l sm:border-slate-200/70 sm:pl-6">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Total Lifetime Earned
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-700">
              {formatINR(totalEarned)}
            </p>
          </div>
        </div>

        {pendingWithdrawals.length > 0 && (
          <div className="relative mt-6 space-y-2">
            {pendingWithdrawals.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                  <Clock3 className="h-3.5 w-3.5 flex-shrink-0" />
                  {formatINR(w.amount)} withdrawal pending review — {w.payout_method === "UPI" ? "UPI" : "Bank Transfer"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="relative mt-6 border-t border-slate-200/60 pt-6">
          <button
            onClick={() => setShowWithdrawForm((v) => !v)}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#1B3FAB] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#1B3FAB]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1635A0] hover:shadow-lg sm:w-auto"
          >
            {showWithdrawForm ? <X className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {showWithdrawForm ? "Close" : "Withdraw Funds"}
          </button>
        </div>

        <AnimatePresence>
          {showWithdrawForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative overflow-hidden"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3 border-t border-slate-200/60 pt-6">
                {submitError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</label>
                    <LockedCurrencyInput
                      value={watch("amount")}
                      onChange={(value) => setValue("amount", value, { shouldValidate: true })}
                      placeholder="10000"
                      inputClassName="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20"
                    />
                    {errors.amount && <p className="mt-1 text-xs font-semibold text-red-500">{errors.amount.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Payout Method</label>
                    <select {...register("payoutMethod")} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none">
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {watch("payoutMethod") === "BANK_TRANSFER" ? "Account Number & IFSC" : "UPI ID"}
                  </label>
                  <input
                    {...register("payoutDetails")}
                    placeholder={watch("payoutMethod") === "BANK_TRANSFER" ? "e.g. 004501234567 · HDFC0000045" : "e.g. yourname@upi"}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20"
                  />
                  {errors.payoutDetails && <p className="mt-1 text-xs font-semibold text-red-500">{errors.payoutDetails.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#1B3FAB] py-3 text-sm font-bold text-white shadow-md shadow-[#1B3FAB]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1635A0] hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {submitting ? "Sending Request…" : "Request Withdrawal"}
                </button>
                <p className="text-center text-xs text-slate-400">
                  WorkBridge staff verify and send every payout — usually within one business day.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Transactions / Invoices split view ── */}
      <div className="mt-6 wb-card-enter" style={{ animationDelay: "160ms" }}>
        <div className="mb-4 flex flex-wrap gap-1.5 rounded-full border border-slate-200 bg-white p-1.5 w-fit">
          {[
            { id: "transactions", label: "Recent Transactions", icon: Receipt },
            { id: "invoices", label: "Download Invoices", icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                activeView === id ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="rounded-2xl border border-white/70 bg-white/60 p-5 shadow-lg shadow-slate-200/40 backdrop-blur-xl"
          >
            {activeView === "transactions" ? (
              (wallet?.transactions ?? []).length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Receipt className="h-6 w-6 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-400">No transactions yet — they'll show up here once a project pays out.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {wallet.transactions.map((t) => {
                    // `direction` is written from the business's side of the
                    // ledger (FUNDS_SECURED is a debit *from the business's
                    // pool*), but this same row is reused here in the
                    // worker's own history, where funds being secured is
                    // good news, not a deduction.
                    const isWorkerCredit = t.direction === "credit" || t.type === "FUNDS_SECURED";
                    return (
                      <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg px-1 py-3 -mx-1 transition-colors hover:bg-slate-50/50">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-slate-700">{t.reference_note ?? t.type}</div>
                          <div className="mt-0.5 text-xs text-slate-400" style={{ fontFamily: "'DM Mono', monospace" }}>
                            {new Date(t.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                        <div className={`flex-shrink-0 text-sm font-bold ${isWorkerCredit ? "text-emerald-600" : "text-slate-500"}`}>
                          {isWorkerCredit ? "+" : "–"}{formatINR(t.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <FileText className="h-6 w-6 text-slate-300" />
                <p className="text-sm font-semibold text-slate-400">No completed projects yet — invoices show up here once one is paid out.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {invoices.map((project) => {
                  const budget = Number(project.budget);
                  const feePct = Number(project.platform_fee_pct ?? 8);
                  const fee = round2(budget * (feePct / 100));
                  const net = round2(budget - fee);
                  return (
                    <div
                      key={project.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0A1128]">{project.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{project.business_name}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Completed{" "}
                          {new Date(project.updated_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-4">
                        <div className="text-right">
                          <p className="font-mono text-sm font-bold text-[#0A1128]">{formatINR(net)}</p>
                          <p className="text-[11px] text-slate-400">of {formatINR(budget)}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/invoice?id=${project.id}`)}
                          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Download PDF
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      </>
      )}
    </div>
  );
}
