import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Clock, Download, Loader2, Lock, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProject, secureFunds } from "../lib/projectsApi";
import { PROJECT_STATUS_META } from "../utils/projectStatus";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { trackEvent } from "../lib/analytics";
import { ApiError } from "../lib/apiClient";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

const FUNDS_SECURED_STATUSES = new Set(["FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED", "COMPLETED"]);

export default function InvoicePage() {
  useDocumentTitle("Invoice — WorkBridge");
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [securing, setSecuring] = useState(false);
  const [secureError, setSecureError] = useState("");

  useEffect(() => {
    if (!projectId) {
      setLoadError("No project specified.");
      setLoading(false);
      return;
    }
    getProject(projectId)
      .then(setProject)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load this invoice."))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
        <div className="flex max-w-md items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{loadError || "Invoice not found."}</span>
        </div>
      </div>
    );
  }

  const isBusinessViewer = currentUser?.id === project.business_id;
  const isWorkerViewer = currentUser?.id === project.worker_id;
  const isSettled = FUNDS_SECURED_STATUSES.has(project.status);
  const budget = Number(project.budget);
  const feePct = Number(project.platform_fee_pct ?? 8);
  const platformFee = Math.round(budget * (feePct / 100));
  const workerReceives = budget - platformFee;

  const handlePayment = async () => {
    if (securing || project.status !== "ACCEPTED") return;
    trackEvent("SecureFundsClicked", { amount: budget, projectId: project.id });
    setSecuring(true);
    setSecureError("");
    try {
      const result = await secureFunds(project.id);
      setProject((prev) => ({ ...prev, ...result.project }));
    } catch (err) {
      setSecureError(err instanceof ApiError ? err.message : "Payment failed — try again.");
    } finally {
      setSecuring(false);
    }
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
                  {isSettled ? "Paid" : PROJECT_STATUS_META[project.status]?.label ?? project.status}
                </span>
              </div>
              <p className="mt-1 font-mono text-sm text-slate-500">#{project.id.slice(0, 8).toUpperCase()}</p>
              <button
                onClick={() => window.print()}
                className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 print:hidden"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
            </div>
          </div>

          {/* ── Participant identity ──────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 border-b border-slate-100 p-6 sm:grid-cols-2 sm:p-10">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Bill To</p>
              <p className="text-lg font-bold text-[#0F172A]">{project.business_name}</p>
              <p className="mt-1 text-sm text-slate-500">Project: {project.title}</p>
            </div>
            <div className="sm:text-right">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Provider</p>
              <p className="text-lg font-bold text-[#0F172A]">{project.worker_name}</p>
              {project.deadline && (
                <p className="mt-1 text-sm text-slate-500">
                  Due: {new Date(project.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
          </div>

          {/* ── Breakdown ──────────────────────────────────────────────── */}
          <div className="p-6 sm:p-10">
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-slate-600">Project Budget</span>
                <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-900">
                  {formatINR(budget)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-slate-600">Platform Fee ({feePct}%) — deducted from worker payout</span>
                <span className="whitespace-nowrap font-mono text-sm text-slate-500">
                  –{formatINR(platformFee)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-slate-600">Worker Receives</span>
                <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-900">
                  {formatINR(workerReceives)}
                </span>
              </div>
            </div>
            <div className="relative mt-2 flex items-center justify-between gap-4 border-t-2 border-slate-900 pt-5">
              <span className="text-base font-bold text-[#0F172A]">Total Secured by Business</span>
              <span className="whitespace-nowrap font-mono text-2xl font-black text-[#0F172A] sm:text-3xl">
                {formatINR(budget)}
              </span>

              {isSettled && (
                <div
                  className="pointer-events-none absolute -top-6 right-0 z-10 -rotate-[13deg] mix-blend-multiply sm:-top-8 sm:right-8"
                  aria-hidden="true"
                >
                  <div className="rounded-md border-[3px] border-emerald-600/80 px-2.5 py-1 sm:px-3 sm:py-1.5">
                    <div className="rounded border border-emerald-600/80 px-2 py-0.5">
                      <span
                        className="text-base font-black uppercase tracking-[0.3em] text-emerald-600/80 sm:text-xl"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mx-6 mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 sm:mx-10 sm:mb-10 print:border-slate-200 print:bg-white">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#10B981]" />
            <p className="text-xs font-semibold leading-relaxed text-emerald-700">
              Funds held securely until work is approved.
            </p>
          </div>

          {/* ── Viewer-specific action area ──────────────────────────────
              Business (on an ACCEPTED project): actionable — secure funds.
              Worker / anyone else: read-only status. ── */}
          {isBusinessViewer && project.status === "ACCEPTED" && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-10 print:hidden">
              {secureError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{secureError}</span>
                </div>
              )}
              <button
                onClick={handlePayment}
                disabled={securing}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-[0_4px_14px_0_rgba(255,107,53,0.39)] transition-all duration-300 active:scale-[0.98] ${
                  securing
                    ? "cursor-not-allowed bg-[#FF6B35]/70"
                    : "bg-[#FF6B35] hover:-translate-y-0.5 hover:bg-[#e55a2b] hover:shadow-xl"
                }`}
              >
                {securing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    Pay {formatINR(budget)} &amp; Secure Funds
                    <Zap className="h-5 w-5" />
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="h-3 w-3" />
                256-bit SSL encrypted checkout
              </p>
            </div>
          )}

          {isBusinessViewer && project.status === "INVITED" && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 text-center sm:p-10">
              <p className="text-sm font-semibold text-slate-500">Waiting for {project.worker_name} to accept this invitation.</p>
            </div>
          )}

          {(isSettled && (isBusinessViewer || isWorkerViewer)) && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-10">
              <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-800">Funds Secured</p>
                  <p className="text-xs text-emerald-600">
                    {formatINR(budget)} is held and protected until work is approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Real activity timeline (project.timeline, not a fake audit log) ── */}
          {project.timeline?.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-10 print:hidden">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Activity Timeline</p>
              <div className="space-y-4 border-l-2 border-slate-200 pl-4">
                {project.timeline.map((event, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                    <p className="text-xs font-semibold text-slate-700">{PROJECT_STATUS_META[event.status]?.label ?? event.status}</p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(event.at).toLocaleString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
