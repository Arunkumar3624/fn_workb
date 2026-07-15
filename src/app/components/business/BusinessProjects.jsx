import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  MessageSquare,
  ShieldCheck,
  Star,
  UserCheck,
  X,
} from "lucide-react";
import { WORKERS } from "../../data/mockData";
import Avatar from "../shared/Avatar";
import TimelineTracker from "../shared/TimelineTracker";
import { usePlatformData } from "../../context/PlatformContext";
import { PROJECT_STATUS_META, calculateEarnings } from "../../utils/projectStatus";
import { motion, AnimatePresence } from "motion/react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

// ─── Tier config ─────────────────────────────────────────────────────────────
const TIER_MAP = {
  gold:  { label: "Top Rated",   bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  blue:  { label: "Rising Star", bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  green: { label: "Standard",    bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

// ─── Worker detail side-drawer (replaces old "View Applicants") ─────────────
function WorkerDetailDrawer({ project, onClose, onChat }) {
  const isOpen = Boolean(project);
  const worker = project ? WORKERS.find((w) => w.name === project.workerName) : null;

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const tier = worker?.tier ? (TIER_MAP[worker.tier] ?? TIER_MAP.green) : null;
  const { fee } = project ? calculateEarnings(project.budget) : { fee: 0 };

  return (
    <AnimatePresence>
      {isOpen && project && (
        <div className="fixed inset-0 z-40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="absolute right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl"
          >
            {/* ── Cover banner ──────────────────────────────────────────── */}
            <div className="relative flex-shrink-0">
              <div className="h-28 bg-[#0F172A] overflow-hidden relative">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#1B3FAB] opacity-25 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 left-12 w-24 h-24 bg-purple-600 opacity-15 rounded-full blur-2xl" />
                <div className="absolute top-4 left-4 w-12 h-12 bg-[#FF6B35] opacity-10 rounded-full blur-xl" />
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar + badges row overlapping cover */}
              <div className="px-6">
                <div className="flex items-end justify-between -mt-10">
                  {/* Avatar */}
                  <div className="relative z-10 flex-shrink-0">
                    <Avatar initials={project.workerInitials} size="w-20 h-20" text="text-xl" />
                    {worker?.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  {/* Tier + elite badges */}
                  <div className="pb-2 flex items-center gap-1.5 flex-wrap justify-end">
                    {tier && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tier.bg} ${tier.text} ${tier.border}`}>
                        {tier.label}
                      </span>
                    )}
                    {worker?.elite && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Elite ✦
                      </span>
                    )}
                  </div>
                </div>

                {/* Name + title + rating */}
                <div className="mt-3 pb-4 border-b border-slate-100">
                  <h2
                    className="text-xl font-extrabold text-[#0F172A]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {project.workerName}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">{worker?.title ?? "Freelancer"}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-[#0F172A]">{worker?.rating}</span>
                    <span className="text-sm text-slate-400">({worker?.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Scrollable body ──────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                {[
                  { label: "Jobs Done",    value: worker?.jobs  ?? "–" },
                  { label: "Total Earned", value: worker?.earned ?? "–" },
                  { label: "Hourly Rate",  value: worker?.rate  ?? "–" },
                ].map(({ label, value }) => (
                  <div key={label} className="py-4 text-center px-2">
                    <p
                      className="text-base font-extrabold text-[#0F172A] truncate"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {value}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {/* Skills */}
                {worker?.skills?.length > 0 && (
                  <div>
                    <p
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {worker.skills.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1.5 bg-[#F4F6FF] text-[#1B3FAB] text-xs font-semibold rounded-lg border border-[#1B3FAB]/10"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trust + Match */}
                {worker && (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3.5">
                    <p
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Trust &amp; Match
                    </p>
                    {[
                      {
                        label: "Trust Score",
                        pct: (worker.behaviorScore / 1000) * 100,
                        display: `${worker.behaviorScore}/1000`,
                        barColor: "bg-emerald-500",
                        textColor: "text-emerald-700",
                      },
                      {
                        label: "Job Match",
                        pct: worker.matchPct,
                        display: `${worker.matchPct}%`,
                        barColor: worker.matchPct >= 80 ? "bg-[#1B3FAB]" : "bg-amber-400",
                        textColor: worker.matchPct >= 80 ? "text-[#1B3FAB]" : "text-amber-700",
                      },
                    ].map(({ label, pct, display, barColor, textColor }) => (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500 w-24 flex-shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-16 text-right ${textColor}`}>{display}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Project Progress */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <p
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Project Progress
                  </p>
                  <p className="text-sm font-bold text-[#0F172A] mb-3 truncate">{project.projectName}</p>
                  {project.projectStatus ? (
                    <div className="-mx-5 mb-3">
                      <TimelineTracker status={project.projectStatus} />
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Due: {project.deadline ?? "—"}</span>
                    <span
                      className="text-base font-extrabold text-[#1B3FAB]"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {formatINR(project.budget)}
                    </span>
                  </div>
                </div>

                {/* Funds Secured */}
                <div className="flex items-center gap-4 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70">
                      Funds Secured
                    </p>
                    <p className="text-sm font-extrabold text-emerald-800 mt-0.5">
                      {formatINR(project.budget)} + {formatINR(fee)} fee
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 border-t border-slate-100 p-5 flex gap-3 bg-white">
              <button
                onClick={() => onChat?.(project.workerName)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1B3FAB] text-white rounded-xl text-sm font-bold hover:bg-[#1635A0] transition-colors shadow-md shadow-[#1B3FAB]/20"
              >
                <MessageSquare className="w-4 h-4" />
                Open Chat
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Payment approval modal ──────────────────────────────────────────────────

function PaymentApprovalModal({ project, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              {/* Modal header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-extrabold text-[#0F172A] text-base"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Approve &amp; Release Payment
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{project.projectName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Payment summary */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2.5 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Worker</span>
                  <span className="font-bold text-[#0F172A]">{project.workerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-[#0F172A]">{formatINR(project.budget)}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Processing</span>
                  <span className="font-bold text-emerald-600">Within 24 hours</span>
                </div>
              </div>

              {/* Admin notice */}
              <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl mb-5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Payment will not be sent immediately. It will be queued and processed by the
                  WorkBridge admin team. You will receive a confirmation email once completed.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
                >
                  Confirm Release
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function BusinessProjects({ onOpenChat }) {
  useDocumentTitle("Active Projects — WorkBridge Business");
  const { businessThreadsDb, completeProject } = usePlatformData();
  const [frozenProjects, setFrozenProjects] = useState(new Set());
  const [paymentProject, setPaymentProject] = useState(null);
  const [workerDrawerProject, setWorkerDrawerProject] = useState(null);

  const liveProjects = businessThreadsDb.filter((t) => t.type === "active" && t.projectStatus !== "COMPLETED");
  const historyProjects = businessThreadsDb.filter((t) => t.projectStatus === "COMPLETED");

  const toggleFreeze = (id) => {
    setFrozenProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmPayment = () => {
    if (paymentProject) {
      completeProject(paymentProject.id);
    }
    setPaymentProject(null);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 p-4 sm:p-7 wb-tab-enter">
      <div className="max-w-5xl mx-auto">
        <h1
          className="text-2xl font-extrabold text-[#0F172A] mb-7"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Active Projects
        </h1>

        <div className="space-y-5">
          {liveProjects.map((p, i) => {
            const isFrozen = frozenProjects.has(p.id);
            const meta = p.projectStatus ? PROJECT_STATUS_META[p.projectStatus] : null;
            const canRelease = p.projectStatus === "FILES_SUBMITTED" && !isFrozen;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 wb-card-enter ${
                  isFrozen
                    ? "border-red-200 shadow-sm shadow-red-100/60"
                    : "border-slate-200 hover:shadow-md"
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Frozen banner */}
                {isFrozen && (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-b border-red-100">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-600">
                      Funds frozen · Payment is paused. Contact the worker to resolve the issue before unfreezing.
                    </p>
                  </div>
                )}

                <div className="p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar initials={p.workerInitials} size="w-12 h-12" text="text-xs" />
                      <div className="min-w-0">
                        <h3
                          className="font-extrabold text-[#0F172A] text-[15px] truncate"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {p.projectName}
                        </h3>
                        <p className="text-sm text-slate-500 mt-0.5 truncate">
                          with {p.workerName} · Due {p.deadline ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 sm:text-right sm:ml-4">
                      <div
                        className="font-extrabold text-[#1B3FAB] text-lg"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {formatINR(p.budget)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        Secured: {formatINR(p.budget)}
                      </div>
                    </div>
                  </div>

                  {/* Lifecycle progress */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1">
                      {p.projectStatus ? (
                        <div className="-mx-1">
                          <TimelineTracker status={p.projectStatus} />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Awaiting funds</span>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                        isFrozen
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}
                    >
                      {isFrozen ? "Frozen" : meta?.label ?? "Pending"}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* View Worker */}
                    <button
                      onClick={() => setWorkerDrawerProject(p)}
                      className="flex min-h-[44px] items-center gap-1.5 px-4 py-2 bg-[#F4F6FF] border border-[#1B3FAB]/15 rounded-xl text-xs font-semibold text-[#1B3FAB] hover:bg-[#1B3FAB]/10 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      View Worker
                    </button>

                    {/* Download Files */}
                    <button className="flex min-h-[44px] items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Download Files
                    </button>

                    {/* Chat → opens Q&A Inbox on this worker's thread */}
                    <button
                      onClick={() => onOpenChat?.(p.workerName)}
                      className="flex min-h-[44px] items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat
                    </button>

                    {/* Freeze / Unfreeze */}
                    <button
                      onClick={() => toggleFreeze(p.id)}
                      className={`flex min-h-[44px] items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        isFrozen
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-50 border border-red-100 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {isFrozen ? "Unfreeze Funds" : "Freeze Funds"}
                    </button>

                    {/* Approve & Release — only once the worker has submitted files */}
                    {canRelease && (
                      <button
                        onClick={() => setPaymentProject(p)}
                        className="flex min-h-[44px] w-full items-center justify-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 hover:-translate-y-0.5 transition-all duration-200 shadow-sm shadow-emerald-500/25 hover:shadow-md sm:ml-auto sm:w-auto sm:justify-start"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve &amp; Release Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {liveProjects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
              No active projects right now.
            </div>
          )}
        </div>

        {/* History — completed & paid projects */}
        {historyProjects.length > 0 && (
          <div className="mt-10">
            <h2
              className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              History
            </h2>
            <div className="space-y-3">
              {historyProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initials={p.workerInitials} size="w-10 h-10" text="text-xs" />
                    <div className="min-w-0">
                      <p className="font-bold text-[#0F172A] text-sm truncate">{p.projectName}</p>
                      <p className="text-xs text-slate-500">with {p.workerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-mono text-sm font-bold text-emerald-700">{formatINR(p.budget)}</span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Worker detail drawer */}
      <WorkerDetailDrawer
        project={workerDrawerProject}
        onClose={() => setWorkerDrawerProject(null)}
        onChat={(name) => {
          setWorkerDrawerProject(null);
          onOpenChat?.(name);
        }}
      />

      {/* Payment approval modal */}
      <PaymentApprovalModal
        project={paymentProject}
        onClose={() => setPaymentProject(null)}
        onConfirm={confirmPayment}
      />
    </div>
  );
}
