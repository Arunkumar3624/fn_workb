import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, Download, ExternalLink, Loader2, Lock, ShieldCheck, Zap } from "lucide-react";
import { usePlatformData } from "../context/PlatformContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { trackEvent } from "../lib/analytics";

// Mock invoice — tied to the QuickCart Retail / Priya Sharma job already
// accepted in the Negotiations flow, so this page reads as a real follow-on
// step rather than a disconnected demo screen.
const INVOICE = {
  number: "INV-2026-0142",
  date: "Jul 14, 2026",
  businessName: "QuickCart Retail",
  workerName: "Priya Sharma",
  workerVerified: true,
  workerProfileUrl: "/p/priya-sharma",
  projectTitle: "Product Photography Retouch",
  baseAmount: 6200,
  platformFeePct: 8,
  gstPct: 18, // GST on the platform's service fee only, per standard marketplace practice
  insuranceFee: 150,
};

// Mock audit trail — only surfaced in the Admin (Audit) view.
const AUDIT_TRAIL = [
  { label: "Invoice generated", time: "Jul 14, 2026 · 9:02 AM", color: "bg-slate-400" },
  { label: "Viewed by business", time: "Jul 14, 2026 · 9:14 AM", color: "bg-blue-500" },
  { label: "Payment received, funds secured", time: "Jul 14, 2026 · 9:15 AM", color: "bg-emerald-500" },
];

const ROLES = [
  { id: "business", label: "Business" },
  { id: "worker", label: "Worker" },
  { id: "admin", label: "Admin (Audit)" },
];

function formatINR(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function InvoicePage() {
  useDocumentTitle(`Invoice ${INVOICE.number} — WorkBridge`);
  const navigate = useNavigate();
  const { advanceBusinessThreadStatus } = usePlatformData();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("idle"); // idle | processing | success

  const roleParam = searchParams.get("role");
  const role = ROLES.some((r) => r.id === roleParam) ? roleParam : "business";
  const threadId = searchParams.get("id");

  const platformFee = Math.round(INVOICE.baseAmount * (INVOICE.platformFeePct / 100));
  const gst = Math.round(platformFee * (INVOICE.gstPct / 100));
  const total = INVOICE.baseAmount + platformFee + gst + INVOICE.insuranceFee;

  // "Settled" from every vantage point once funds are secured — drives the
  // header status pill and the rotated Paid stamp, regardless of role.
  const isSettled = role === "worker" || role === "admin" || (role === "business" && status === "success");

  // Mocks the API call that would move funds into secure holding for this
  // project — this is the "System (Post-Payment)" trigger that kicks off the
  // Project Lifecycle FSM for whichever thread sent the business here.
  const handlePayment = () => {
    if (status !== "idle") return;
    trackEvent("PaymentClicked", { amount: total, invoiceNumber: INVOICE.number });
    setStatus("processing");
    window.setTimeout(() => {
      setStatus("success");
      if (role === "business" && threadId) {
        advanceBusinessThreadStatus(threadId, "FUNDS_SECURED");
      }
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:py-16 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-4xl">

        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#0F172A] print:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] print:border-0 print:shadow-none">

          {/* Paid stamp — a physical-document flourish, only once funds are actually settled */}
          {isSettled && (
            <div
              className="pointer-events-none absolute right-8 top-24 z-10 -rotate-[18deg] rounded-lg border-4 border-emerald-500/70 px-4 py-1.5 text-xl font-black uppercase tracking-widest text-emerald-500/70 sm:right-12 sm:top-28"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              aria-hidden="true"
            >
              Paid
            </div>
          )}

          {role === "admin" && (
            <div className="flex items-center gap-2 bg-slate-900 px-6 py-2.5 text-white print:hidden">
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-200">
                Admin Audit View — Read Only
              </p>
            </div>
          )}

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF6B35]">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span
                className="text-lg font-extrabold text-[#0F172A]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                WorkBridge
              </span>
            </div>
            <div className="text-left sm:text-right">
              <div className="flex items-center gap-2 sm:justify-end">
                <p className="font-serif text-2xl font-bold text-[#0F172A]">Invoice</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                    isSettled ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {isSettled ? "Paid" : "Pending"}
                </span>
              </div>
              <p className="mt-1 font-mono text-sm text-slate-500">#{INVOICE.number}</p>
              <button className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 print:hidden">
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
            </div>
          </div>

          {/* ── Participant identity ──────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 border-b border-slate-100 p-6 sm:grid-cols-2 sm:p-10">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Bill To</p>
              <p className="text-lg font-bold text-[#0F172A]">{INVOICE.businessName}</p>
              <p className="mt-1 text-sm text-slate-500">Project: {INVOICE.projectTitle}</p>
            </div>
            <div className="sm:text-right">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Provider</p>
              <div className="flex items-center gap-2 sm:justify-end">
                <p className="text-lg font-bold text-[#0F172A]">{INVOICE.workerName}</p>
                {INVOICE.workerVerified && <ShieldCheck className="h-4 w-4 flex-shrink-0 text-blue-500" />}
              </div>
              <p className="mt-1 text-sm text-slate-500">Invoice Date: {INVOICE.date}</p>
              <a
                href={INVOICE.workerProfileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#1B3FAB] hover:underline print:hidden"
              >
                View portfolio
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* ── Breakdown (identical across all three roles) ────────────── */}
          <div className="p-6 sm:p-10">
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-slate-600">Base Proposal Amount</span>
                <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-900">
                  {formatINR(INVOICE.baseAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-slate-600">Platform Service Fee ({INVOICE.platformFeePct}%)</span>
                <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-900">
                  {formatINR(platformFee)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-slate-600">GST on Service Fee ({INVOICE.gstPct}%)</span>
                <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-900">
                  {formatINR(gst)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-slate-600">Insurance Coverage Fee</span>
                <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-900">
                  {formatINR(INVOICE.insuranceFee)}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4 border-t-2 border-slate-900 pt-5">
              <span className="text-base font-bold text-[#0F172A]">Total Amount</span>
              <span className="whitespace-nowrap font-mono text-2xl font-black text-[#0F172A] sm:text-3xl">
                {formatINR(total)}
              </span>
            </div>
          </div>

          {/* ── Trust strip ────────────────────────────────────────────── */}
          <div className="mx-6 mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 sm:mx-10 sm:mb-10 print:border-slate-200 print:bg-white">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#10B981]" />
            <p className="text-xs font-semibold leading-relaxed text-emerald-700">
              Funds held securely until work is approved. Protected by WorkBridge Legal.
            </p>
          </div>

          {/* ── Role-specific footer ─────────────────────────────────────
              Business: actionable — the conversion moment.
              Worker:   read-only — a status badge confirming what's owed.
              Admin:    audit — a read-only trail for dispute resolution. ── */}
          {role === "business" && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-10 print:hidden">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
                  <div className="flex h-14 w-14 animate-in items-center justify-center rounded-full bg-emerald-100 zoom-in duration-300">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-bold text-[#0F172A]">Payment Successful</p>
                  <p className="text-sm text-slate-500">
                    Funds are now held securely — {INVOICE.workerName} has been notified.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePayment}
                    disabled={status === "processing"}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-[0_4px_14px_0_rgba(255,107,53,0.39)] transition-all duration-300 active:scale-[0.98] ${
                      status === "processing"
                        ? "cursor-not-allowed bg-[#FF6B35]/70"
                        : "bg-[#FF6B35] hover:-translate-y-0.5 hover:bg-[#e55a2b] hover:shadow-xl"
                    }`}
                  >
                    {status === "processing" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        Pay {formatINR(total)} &amp; Secure Funds
                        <Zap className="h-5 w-5" />
                      </>
                    )}
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <Lock className="h-3 w-3" />
                    256-bit SSL encrypted checkout
                  </p>
                </>
              )}
            </div>
          )}

          {role === "worker" && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-10">
              <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-800">Funds Secured</p>
                  <p className="text-xs text-emerald-600">
                    {formatINR(total)} is held and protected until you deliver approved work.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-400">
                This is a read-only view — payment is managed by {INVOICE.businessName}.
              </p>
            </div>
          )}

          {role === "admin" && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-10 print:hidden">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Audit Trail</p>
              <div className="space-y-4 border-l-2 border-slate-200 pl-4">
                {AUDIT_TRAIL.map((entry) => (
                  <div key={entry.label} className="relative">
                    <div className={`absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white shadow-sm ${entry.color}`} />
                    <p className="text-xs font-semibold text-slate-700">{entry.label}</p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-2.5 w-2.5" />
                      {entry.time}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                <p className="text-xs font-bold text-slate-700">Payment Status: Secured</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
