import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Lock, Wallet, Zap, AlertCircle, Loader2, Receipt, FileText, ArrowRight, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import LockedCurrencyInput from "../common/LockedCurrencyInput";
import { positiveCurrencySchema } from "../../utils/formValidation";
import { getWallet, withdraw } from "../../lib/walletApi";
import { listProjects } from "../../lib/projectsApi";
import { ApiError } from "../../lib/apiClient";

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

const withdrawalSchema = z.object({
  amount: positiveCurrencySchema,
  destination: z.string().min(2),
});

export default function WorkerWallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [heldSecurely, setHeldSecurely] = useState(0);
  const [invoices, setInvoices] = useState([]);
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
      const [walletData, projects, completed] = await Promise.all([
        getWallet(),
        listProjects({ role: "worker" }),
        listProjects({ role: "worker", status: "COMPLETED" }),
      ]);
      setWallet(walletData);
      setHeldSecurely(
        projects
          .filter((p) => IN_ESCROW_STATUSES.has(p.status))
          .reduce((sum, p) => sum + Number(p.budget), 0)
      );
      setInvoices(completed);
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
      setShowWithdrawForm(false);
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

      {/* ── Financial Vault ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/50 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-2xl sm:p-8 wb-card-enter">
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#1B3FAB]/10 blur-[80px]" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Wallet className="h-3.5 w-3.5 text-[#1B3FAB]" />
              Ready to Cash Out
            </p>
            <p
              className="mt-2 text-4xl font-black tracking-tight text-[#0A1128] sm:text-5xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {formatINR(wallet?.balance)}
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                {formatINR(totalEarned)} total earned
              </p>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Lock className="h-3.5 w-3.5 text-amber-500" />
                {formatINR(heldSecurely)} held securely
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowWithdrawForm((v) => !v)}
            className="flex min-h-[48px] flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1B3FAB] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#1B3FAB]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1635A0] hover:shadow-lg"
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
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Withdraw to</label>
                    <select {...register("destination")} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none">
                      <option>Primary Bank Account</option>
                      <option>Google Pay UPI</option>
                      <option>PhonePe UPI</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#1B3FAB] py-3 text-sm font-bold text-white shadow-md shadow-[#1B3FAB]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1635A0] hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {submitting ? "Processing…" : "Confirm Withdrawal"}
                </button>
                <p className="text-center text-xs text-slate-400">Platform commission already deducted from earnings.</p>
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
    </div>
  );
}
