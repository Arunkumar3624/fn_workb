import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  Briefcase,
  Check,
  CheckCircle2,
  Download,
  Loader2,
  Lock,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import TimelineTracker from "../shared/TimelineTracker";
import ProjectCompletionHub from "../shared/ProjectCompletionHub";
import DeliverablesPanel from "../shared/DeliverablesPanel";
import ChatThread from "../shared/ChatThread";
import { PROJECT_STATUS_META } from "../../utils/projectStatus";
import {
  listBusinessProjects,
  completeProject as apiCompleteProject,
  secureFunds as apiSecureFunds,
  updateProjectStatus as apiUpdateProjectStatus,
  createProject,
} from "../../lib/projectsApi";
import { listCandidatesForProject, respondToCandidate } from "../../lib/candidatesApi";
import { getPublicProfile } from "../../lib/profilesApi";
import { listSubmissions } from "../../lib/submissionsApi";
import { submitReview, listReviewsFor } from "../../lib/reviewsApi";
import { getInitials } from "../../utils/formValidation";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../lib/socketClient";
import { motion, AnimatePresence } from "motion/react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const HEADING_FONT = { fontFamily: "'Lexend', sans-serif" };
const DATA_FONT = { fontFamily: "'Inter', sans-serif" };

// Maps PROJECT_STATUS_META's `tone` to a real badge color — replaces the old
// hardcoded red-vs-blue logic that only ever knew about the fake local
// "frozen" state, not real statuses like DISPUTED/CANCELLED.
const STATUS_TONE_CLASSES = {
  slate: "border-slate-200 bg-slate-50 text-slate-600",
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-600",
};

function formatINR(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Worker detail side-drawer ───────────────────────────────────────────────
// Fetches the real public profile (GET /api/profiles/:id — the one
// unauthenticated route) on open, rather than showing mock skills/trust-score
// data schema.sql has no columns for.
function WorkerDetailDrawer({ project, onClose }) {
  const isOpen = Boolean(project);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    getPublicProfile(project.worker_id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Couldn't load this worker's profile.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, project?.worker_id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const feePct = Number(project?.platform_fee_pct ?? 8);
  const fee = project ? Math.round(Number(project.budget) * (feePct / 100)) : 0;

  // Rendered via a portal straight onto document.body — nesting this inside
  // the tab's own root div (which carries .wb-tab-enter) would make it a
  // descendant of an element that permanently holds a (no-op) CSS transform
  // once its entrance animation finishes (animation-fill-mode: both keeps
  // the `to` keyframe's `transform: translateY(0)` applied forever). Any
  // non-`none` transform on an ancestor turns it into the containing block
  // for `position: fixed` children, so this modal would center itself
  // against that tall scrollable div instead of the actual viewport —
  // exactly the "renders in the middle of the whole page, not the screen"
  // bug. Portaling to document.body sidesteps that entirely.
  return createPortal(
    <AnimatePresence>
      {isOpen && project && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="relative flex-shrink-0">
              <div className="relative h-28 overflow-hidden bg-[#0F172A]">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#1B3FAB] opacity-25 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 left-12 w-24 h-24 bg-purple-600 opacity-15 rounded-full blur-2xl" />
                <button
                  onClick={onClose}
                  aria-label="Close worker details"
                  className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6">
                <div className="flex items-end justify-between -mt-10">
                  <div className="relative z-10 flex-shrink-0">
                    <Avatar initials={getInitials(project.worker_name)} bg="bg-[#1B3FAB]" size="w-20 h-20" text="text-xl" />
                    {profile?.verified && (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                        <ShieldCheck className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-extrabold text-[#0F172A]" style={HEADING_FONT}>
                    {project.worker_name}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500" style={DATA_FONT}>
                    {profile?.title ?? "Freelancer"}
                  </p>
                  {profile?.rating != null && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-[#0F172A]" style={DATA_FONT}>
                        {profile.rating}
                      </span>
                      <span className="text-sm text-slate-400" style={DATA_FONT}>
                        ({profile.reviews_count} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400" style={DATA_FONT}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading profile…
                </div>
              )}

              {loadError && !isLoading && (
                <div className="m-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600" style={DATA_FONT}>
                  {loadError}
                </div>
              )}

              {!isLoading && !loadError && (
                <div className="p-6 space-y-5">
                  {profile?.behavior_score != null && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400" style={HEADING_FONT}>
                        Behavior Score
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${(profile.behavior_score / 1000) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-700" style={DATA_FONT}>
                          {profile.behavior_score}/1000
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400" style={HEADING_FONT}>
                      Project Progress
                    </p>
                    <p className="mb-3 truncate text-sm font-bold text-[#0F172A]" style={DATA_FONT}>
                      {project.title}
                    </p>
                    <div className="-mx-5 mb-3">
                      <TimelineTracker status={project.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400" style={DATA_FONT}>
                        Due: {formatDate(project.deadline)}
                      </span>
                      <span className="text-base font-extrabold text-[#1B3FAB]" style={DATA_FONT}>
                        {formatINR(project.budget)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70" style={HEADING_FONT}>
                        Funds Secured
                      </p>
                      <p className="mt-0.5 text-sm font-extrabold text-emerald-800" style={DATA_FONT}>
                        {formatINR(project.budget)} + {formatINR(fee)} fee
                      </p>
                    </div>
                  </div>

                  <DeliverablesPanel projectId={project.id} />

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400" style={HEADING_FONT}>Chat</p>
                      <p className="mt-1 text-sm font-bold text-[#0F172A]" style={DATA_FONT}>Message {project.worker_name}</p>
                      <p className="mt-1 text-xs text-slate-400" style={DATA_FONT}>Keep contact details off WorkBridge — sharing phone numbers or emails isn't allowed.</p>
                    </div>
                    <div className="flex h-[420px] flex-col">
                      <ChatThread projectId={project.id} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-shrink-0 gap-3 border-t border-slate-100 bg-white p-5">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Payment approval modal ──────────────────────────────────────────────────
function PaymentApprovalModal({ project, isSubmitting, submitError, onClose, onConfirm }) {
  // Portaled to document.body for the same reason as WorkerDetailDrawer
  // above — nested inside .wb-tab-enter's permanently-transformed root div,
  // `fixed` would anchor to that div instead of the real viewport.
  return createPortal(
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={isSubmitting ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl"
          >
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
                  <Lock className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-[#0F172A]" style={HEADING_FONT}>
                    Approve &amp; Release Payment
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-400" style={DATA_FONT}>
                    {project.title}
                  </p>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={onClose}
                    aria-label="Cancel"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mb-4 space-y-2.5 rounded-xl bg-slate-50 p-4 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Worker</span>
                  <span className="font-bold text-[#0F172A]">{project.worker_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-[#0F172A]">{formatINR(project.budget)}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Processing</span>
                  <span className="font-bold text-emerald-600">Immediate</span>
                </div>
              </div>

              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-3.5">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                <p className="text-xs leading-relaxed text-blue-700" style={DATA_FONT}>
                  This runs as a single atomic transaction — the project status, the ledger
                  entry, and the worker's wallet all update together, or none of them do.
                </p>
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-semibold text-red-600"
                >
                  {submitError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isSubmitting}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-600/60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    "Confirm Release"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Request revision modal ──────────────────────────────────────────────────
// Sends a FILES_SUBMITTED project back to WORK_IN_PROGRESS instead of a full
// approve/dispute — the middle ground for "90% there, just needs a tweak".
function RequestRevisionModal({ project, note, onNoteChange, isSubmitting, submitError, onClose, onConfirm }) {
  // Portaled to document.body — see WorkerDetailDrawer's comment above for why.
  return createPortal(
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={isSubmitting ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl"
          >
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50">
                  <RotateCcw className="h-5 w-5 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-[#0F172A]" style={HEADING_FONT}>
                    Request Revision
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-400" style={DATA_FONT}>
                    {project.title}
                  </p>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={onClose}
                    aria-label="Cancel"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="mb-3 text-xs leading-relaxed text-slate-500" style={DATA_FONT}>
                This sends the project back to <span className="font-semibold text-slate-700">In Progress</span> so{" "}
                {project.worker_name} can upload a new file. Let them know what to fix.
              </p>

              <textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                disabled={isSubmitting}
                rows={3}
                maxLength={1000}
                placeholder="e.g. Could you make the logo blue and resend? (optional)"
                className="mb-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-400/10 disabled:opacity-60"
              />

              {submitError && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-semibold text-red-600"
                >
                  {submitError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isSubmitting}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-600/60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Back for Revision"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Raise dispute confirm modal ──────────────────────────────────────────────
function DisputeConfirmModal({ project, isSubmitting, submitError, onClose, onConfirm }) {
  // Portaled to document.body — see WorkerDetailDrawer's comment above for why.
  return createPortal(
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={isSubmitting ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl"
          >
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-[#0F172A]" style={HEADING_FONT}>
                    Raise a Dispute
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-slate-400" style={DATA_FONT}>
                    {project.title}
                  </p>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={onClose}
                    aria-label="Cancel"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="mb-5 text-xs leading-relaxed text-slate-500" style={DATA_FONT}>
                This pauses the project and hands it to WorkBridge for review — funds stay held until
                an admin resolves the dispute. Use this only when a revision request isn't enough.
              </p>

              {submitError && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-semibold text-red-600"
                >
                  {submitError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isSubmitting}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white shadow-md shadow-red-500/20 transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-600/60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Raising…
                    </>
                  ) : (
                    "Raise Dispute"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Open Job Board — applicants + invites review ────────────────────────────
// Every candidacy (source=APPLICATION or INVITE) against one of the
// business's own OPEN posts — accepting one assigns the project for real
// (OPEN -> ACCEPTED) and closes every sibling candidacy automatically on
// the backend (see job_candidates.controller.js's respondToCandidate).
function ApplicantsModal({ project, candidates, isLoading, respondingId, onClose, onRespond }) {
  return createPortal(
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Applicants &amp; Invites</p>
                <h3 className="truncate text-base font-extrabold text-[#0F172A]" style={HEADING_FONT}>
                  {project.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="wb-scroll-clean min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                </div>
              ) : candidates.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No applicants or invites yet — this post is still live on the Job Feed.
                </p>
              ) : (
                candidates.map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt={c.worker_name} className="h-10 w-10 flex-shrink-0 rounded-xl object-cover" />
                      ) : (
                        <Avatar initials={getInitials(c.worker_name)} bg="bg-[#1B3FAB]" size="w-10 h-10" text="text-xs" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-bold text-[#0F172A]">{c.worker_name}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              c.source === "INVITE" ? "bg-[#F4F6FF] text-[#1B3FAB]" : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {c.source === "INVITE" ? "You invited" : "Applied"}
                          </span>
                          {c.status !== "PENDING" && (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              {c.status}
                            </span>
                          )}
                        </div>
                        {c.worker_title && <p className="text-xs text-slate-500">{c.worker_title}</p>}
                        {c.rating != null && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {c.rating} ({c.reviews_count ?? 0})
                          </div>
                        )}
                        {c.message && <p className="mt-2 text-xs leading-5 text-slate-600">"{c.message}"</p>}
                      </div>
                      {c.status === "PENDING" && (
                        <div className="flex flex-shrink-0 flex-col gap-1.5">
                          <button
                            onClick={() => onRespond(c.id, true)}
                            disabled={respondingId === c.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#1B3FAB] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#15338d] disabled:opacity-60"
                          >
                            {respondingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            Accept
                          </button>
                          <button
                            onClick={() => onRespond(c.id, false)}
                            disabled={respondingId === c.id}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Rating + Rehire modal (History rows) ────────────────────────────────────
function RatingModal({ project, currentUserId, onClose, onRehire, onRated }) {
  const [existingReview, setExistingReview] = useState(undefined);

  useEffect(() => {
    if (!project) return;
    setExistingReview(undefined);
    listReviewsFor(project.worker_id)
      .then((reviews) => {
        const mine = reviews.find((r) => r.project_id === project.id && r.reviewer_id === currentUserId);
        setExistingReview(mine ?? null);
      })
      .catch(() => setExistingReview(null));
  }, [project, currentUserId]);

  if (!project) return null;

  const feePct = Number(project.platform_fee_pct ?? 8);
  const earnings = Math.round(Number(project.budget) * (1 - feePct / 100));

  // Portaled to document.body — see WorkerDetailDrawer's comment above for why.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
        {existingReview === undefined ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : (
          <ProjectCompletionHub
            perspective="business"
            counterpartName={project.worker_name}
            amount={earnings}
            review={existingReview}
            onSubmit={async (rating, feedback) => {
              const created = await submitReview({ projectId: project.id, rating, feedback });
              setExistingReview(created);
              onRated?.(project.id, created.rating);
              return created;
            }}
            onRehire={onRehire}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function BusinessProjects() {
  useDocumentTitle("Active Projects — WorkBridge Business");
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [revisionProject, setRevisionProject] = useState(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [submittingRevisionId, setSubmittingRevisionId] = useState(null);
  const [revisionError, setRevisionError] = useState(null);
  const [disputeProject, setDisputeProject] = useState(null);
  const [submittingDisputeId, setSubmittingDisputeId] = useState(null);
  const [disputeError, setDisputeError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [paymentProject, setPaymentProject] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [completeError, setCompleteError] = useState(null);
  const [workerDrawerProject, setWorkerDrawerProject] = useState(null);
  const [securingId, setSecuringId] = useState(null);
  const [secureError, setSecureError] = useState(null);
  const [ratingProject, setRatingProject] = useState(null);
  const [rehireToast, setRehireToast] = useState("");
  // projectId -> rating, so a History row can show the stars you already gave
  // without having to reopen the modal every time.
  const [ratingsByProject, setRatingsByProject] = useState({});
  const [applicantsProject, setApplicantsProject] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [respondingCandidateId, setRespondingCandidateId] = useState(null);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await listBusinessProjects();
      setProjects(data);
    } catch (err) {
      setLoadError(err.message || "Couldn't load projects — is the backend running?");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const openApplicants = (project) => {
    setApplicantsProject(project);
    setApplicantsLoading(true);
    listCandidatesForProject(project.id)
      .then(setApplicants)
      .catch(() => setApplicants([]))
      .finally(() => setApplicantsLoading(false));
  };

  const handleRespondToCandidate = async (candidateId, accept) => {
    setRespondingCandidateId(candidateId);
    try {
      await respondToCandidate(candidateId, accept);
      toast.success(accept ? "Candidate accepted — project is now underway." : "Application declined.");
      if (accept) {
        setApplicantsProject(null);
        loadProjects();
      } else if (applicantsProject) {
        listCandidatesForProject(applicantsProject.id).then(setApplicants).catch(() => {});
      }
    } catch (err) {
      toast.error(err.message || "Could not respond to this candidate.");
    } finally {
      setRespondingCandidateId(null);
    }
  };

  const handleWithdrawPost = async (id) => {
    setWithdrawingId(id);
    try {
      const updated = await apiUpdateProjectStatus(id, "CANCELLED");
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setConfirmWithdrawId(null);
    } catch (err) {
      toast.error(err.message || "Could not withdraw this post.");
    } finally {
      setWithdrawingId(null);
    }
  };

  // CANCELLED used to only be excluded from history (still counted as
  // "live" here), so a declined/cancelled project sat in Active Projects
  // forever showing action buttons (Raise Dispute, Download Files) that no
  // longer make sense once it's actually done.
  const liveProjects = projects.filter((p) => p.status !== "COMPLETED" && p.status !== "CANCELLED");
  const historyProjects = projects.filter((p) => p.status === "COMPLETED" || p.status === "CANCELLED");

  // Kept in a ref (not read from `projects` directly) so the socket
  // subscription below — mounted once — never closes over a stale list.
  const projectsRef = useRef(projects);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Live nudge for state changes the worker/admin side makes while this tab
  // is open — this component previously had zero realtime wiring, so a
  // worker starting/submitting work or an admin reviewing a deliverable
  // never showed up here without a manual refresh. FUNDS_SECURED/COMPLETED
  // are this business's own actions (already reflected via the direct REST
  // response in handleSecureFunds/handleConfirmPayment) — patched silently
  // here too, only for the rare second-open-tab case, no duplicate toast.
  // See backend/src/realtime/events.js for the emit side.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleProjectEvent = (event) => {
      const project = projectsRef.current.find((p) => p.id === event.projectId);
      if (!project) return;

      switch (event.type) {
        case "FUNDS_SECURED":
          setProjects((prev) => prev.map((p) => (p.id === event.projectId ? { ...p, status: "FUNDS_SECURED" } : p)));
          break;
        case "COMPLETED":
          setProjects((prev) => prev.map((p) => (p.id === event.projectId ? { ...p, status: "COMPLETED" } : p)));
          break;
        case "STATUS_CHANGED":
          setProjects((prev) => prev.map((p) => (p.id === event.projectId ? { ...p, status: event.status } : p)));
          if (event.actorRole !== "business") {
            toast.info(`${project.worker_name} updated "${project.title}" to ${event.status.replaceAll("_", " ").toLowerCase()}.`);
          }
          break;
        case "SUBMISSION_CREATED":
          if (event.submittedBy !== currentUser?.id) {
            toast.info(`${project.worker_name} submitted new work on "${project.title}" — pending review.`);
          }
          break;
        case "SUBMISSION_REVIEWED":
          toast.info(`A submission on "${project.title}" was ${event.status.toLowerCase()} by WorkBridge.`);
          break;
        case "REVIEW_SUBMITTED":
          if (event.revieweeId === currentUser?.id) {
            toast.success(`${project.worker_name} left you a ${event.rating}★ review on "${project.title}".`);
          }
          break;
        default:
          break;
      }
    };

    socket.on("project:event", handleProjectEvent);
    return () => socket.off("project:event", handleProjectEvent);
  }, [currentUser?.id]);

  // Populate ratingsByProject once history projects are known — one
  // listReviewsFor call per unique worker (not per project), matched back to
  // the project the review was actually left on.
  useEffect(() => {
    if (historyProjects.length === 0 || !currentUser?.id) return;
    let cancelled = false;
    const workerIds = [...new Set(historyProjects.map((p) => p.worker_id).filter(Boolean))];
    Promise.all(workerIds.map((workerId) => listReviewsFor(workerId).catch(() => [])))
      .then((results) => {
        if (cancelled) return;
        const map = {};
        results.flat().forEach((review) => {
          if (review.reviewer_id === currentUser.id) map[review.project_id] = review.rating;
        });
        setRatingsByProject(map);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, currentUser?.id]);

  const handleConfirmRevision = async () => {
    if (!revisionProject || submittingRevisionId) return;
    const id = revisionProject.id;
    setSubmittingRevisionId(id);
    setRevisionError(null);
    try {
      const updated = await apiUpdateProjectStatus(id, "WORK_IN_PROGRESS", revisionNote.trim());
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setRevisionProject(null);
      setRevisionNote("");
    } catch (err) {
      setRevisionError(err.message || "Couldn't request a revision — try again.");
    } finally {
      setSubmittingRevisionId(null);
    }
  };

  const handleConfirmDispute = async () => {
    if (!disputeProject || submittingDisputeId) return;
    const id = disputeProject.id;
    setSubmittingDisputeId(id);
    setDisputeError(null);
    try {
      const updated = await apiUpdateProjectStatus(id, "DISPUTED");
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setDisputeProject(null);
    } catch (err) {
      setDisputeError(err.message || "Couldn't raise a dispute — try again.");
    } finally {
      setSubmittingDisputeId(null);
    }
  };

  // Defensive: setCompletingId is set synchronously before the API call, and
  // the button below is disabled the instant that's true — a rapid
  // double-click can't fire this twice. try/catch/finally guarantees the
  // loading state always clears, success or failure, so the button never
  // gets stuck.
  const handleConfirmPayment = async () => {
    if (!paymentProject || completingId) return;
    const id = paymentProject.id;
    setCompletingId(id);
    setCompleteError(null);
    try {
      const result = await apiCompleteProject(id);
      setProjects((prev) => prev.map((p) => (p.id === id ? result.project : p)));
      setPaymentProject(null);
    } catch (err) {
      setCompleteError(err.message || "Couldn't release payment — try again.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleSecureFunds = async (id) => {
    if (securingId) return;
    setSecuringId(id);
    setSecureError(null);
    try {
      const result = await apiSecureFunds(id);
      setProjects((prev) => prev.map((p) => (p.id === id ? result.project : p)));
    } catch (err) {
      setSecureError(err.message || "Couldn't secure funds — try again.");
    } finally {
      setSecuringId(null);
    }
  };

  // The old "Download Files" button just opened the worker-detail drawer
  // (same as "View Worker") — clicking it never actually downloaded
  // anything. This fetches the project's real approved deliverables and
  // forces a real download/open per submission: a link opens in a new tab,
  // an inline image is forced through a temporary <a download> element so
  // the browser treats it as a file save rather than just navigating to it.
  const handleDownloadFiles = async (project) => {
    if (downloadingId) return;
    setDownloadingId(project.id);
    try {
      const submissions = await listSubmissions(project.id);
      const approved = submissions.filter((s) => s.status === "APPROVED");
      if (approved.length === 0) {
        toast.info("No approved deliverables yet — check back once the worker submits and it clears review.");
        return;
      }

      let hasLinks = false;
      approved.forEach((submission, index) => {
        if (submission.type === "link") {
          hasLinks = true;
          return;
        }
        // A real download only for images — a synchronous-looking anchor
        // click still works reliably here even after the await above.
        const anchor = document.createElement("a");
        anchor.href = submission.image_data;
        anchor.download = `${project.title}-deliverable-${index + 1}.png`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      });

      if (hasLinks) {
        // window.open() called after an `await` is silently blocked by the
        // popup blocker in most browsers — it's no longer treated as a
        // direct result of the click that triggered this handler. That's
        // exactly why "Download Files" could look like it did nothing:
        // nothing was actually broken server-side, the new tab just never
        // opened. Real <a href target="_blank"> clicks inside the worker
        // drawer don't have this problem, so route link submissions there
        // instead of trying to window.open() them from here.
        setWorkerDrawerProject(project);
      }
    } catch (err) {
      toast.error(err.message || "Could not load this project's deliverables.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRehire = async (project) => {
    const workerLabel = project.worker_name || "the freelancer";
    try {
      await createProject({
        workerId: project.worker_id,
        title: `New task with ${workerLabel}`,
        description: `Follow-up work after "${project.title}".`,
        budget: Number(project.budget),
      });
      setRehireToast(`Invitation sent to ${workerLabel} for a new task.`);
      window.setTimeout(() => setRehireToast(""), 2800);
    } catch (err) {
      setRehireToast(err.message || "Could not send the rehire invite.");
      window.setTimeout(() => setRehireToast(""), 2800);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 p-4 sm:p-7 wb-tab-enter" style={DATA_FONT}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-[#0F172A]" style={HEADING_FONT}>
            Active Projects
          </h1>
          <button
            onClick={loadProjects}
            disabled={isLoading}
            aria-label="Refresh projects"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Secondary, non-text-heavy trust panel — the one deliberately
            translucent glass surface on this page; financial data below
            stays on solid/near-solid backgrounds for readability. */}
        <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-slate-600 shadow-sm backdrop-blur-2xl">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
          <p className="text-xs font-semibold">Every payment release is a single atomic transaction — WorkBridge Payment Protection.</p>
        </div>

        {loadError && (
          <div role="alert" className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-600">{loadError}</p>
            <button
              onClick={loadProjects}
              className="flex-shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        {secureError && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-600">{secureError}</p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white/90" />
            ))}
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="space-y-5">
            <AnimatePresence>
              {liveProjects.map((p, i) => {
                // An OPEN post has no worker yet (worker_name is null) — none
                // of the assigned-project actions below apply to it, so it
                // gets its own simple card instead of falling through to the
                // normal one (which assumes a real worker exists).
                if (p.status === "OPEN") {
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      className="overflow-hidden rounded-2xl border border-[#1B3FAB]/20 bg-white/90 p-4 backdrop-blur-sm sm:p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F6FF] px-2.5 py-1 text-[11px] font-bold text-[#1B3FAB]">
                            <Briefcase className="h-3 w-3" />
                            Live on Job Feed
                          </span>
                          <h3 className="mt-2 truncate text-[15px] font-extrabold text-[#0F172A]" style={HEADING_FONT}>
                            {p.title}
                          </h3>
                          <p className="mt-0.5 text-sm text-slate-500">No worker assigned yet — anyone can apply, or invite someone directly.</p>
                        </div>
                        <div className="flex-shrink-0 sm:text-right">
                          <div className="text-lg font-extrabold text-[#1B3FAB]">{formatINR(p.budget)}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => openApplicants(p)}
                          className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#1B3FAB] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1635A0]"
                        >
                          <Users className="h-3.5 w-3.5" />
                          View Applicants
                        </button>
                        {confirmWithdrawId === p.id ? (
                          <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                            Withdraw this post?
                            <button
                              onClick={() => handleWithdrawPost(p.id)}
                              disabled={withdrawingId === p.id}
                              className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              {withdrawingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmWithdrawId(null)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmWithdrawId(p.id)}
                            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Withdraw Post
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                }

                const isDisputed = p.status === "DISPUTED";
                const meta = p.status ? PROJECT_STATUS_META[p.status] : null;
                const badgeTone = STATUS_TONE_CLASSES[meta?.tone] ?? STATUS_TONE_CLASSES.blue;
                const canRelease = p.status === "FILES_SUBMITTED";
                const canRequestRevision = p.status === "FILES_SUBMITTED";
                const canDispute = !["DISPUTED", "CANCELLED", "COMPLETED"].includes(p.status);
                const isCompletingThis = completingId === p.id;

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className={`overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm transition-shadow duration-200 ${
                      isDisputed ? "border-red-200 shadow-sm shadow-red-100/60" : "border-slate-200 hover:shadow-md"
                    }`}
                  >
                    {isDisputed && (
                      <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-5 py-2.5">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                        <p className="text-xs font-bold text-red-600">
                          Dispute raised · Funds stay held until WorkBridge reviews this project.
                        </p>
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar initials={getInitials(p.worker_name)} bg="bg-[#1B3FAB]" size="w-12 h-12" text="text-xs" />
                          <div className="min-w-0">
                            <h3 className="truncate text-[15px] font-extrabold text-[#0F172A]" style={HEADING_FONT}>
                              {p.title}
                            </h3>
                            <p className="mt-0.5 truncate text-sm text-slate-500">
                              with {p.worker_name} · Due {formatDate(p.deadline)}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 sm:ml-4 sm:text-right">
                          <div className="text-lg font-extrabold text-[#1B3FAB]">{formatINR(p.budget)}</div>
                          <div className="mt-0.5 font-mono text-xs text-slate-400">Secured: {formatINR(p.budget)}</div>
                        </div>
                      </div>

                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex-1">
                          <TimelineTracker status={p.status} />
                        </div>
                        <span
                          role="status"
                          aria-live="polite"
                          aria-label={`Project status: ${meta?.label ?? "Pending"}`}
                          className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${badgeTone}`}
                        >
                          {meta?.label ?? "Pending"}
                        </span>
                      </div>

                      {/* Action buttons — kept visually separate from the ledger/
                          status above so a rupee figure never reads as clickable */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => setWorkerDrawerProject(p)}
                          className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#1B3FAB]/15 bg-[#F4F6FF] px-4 py-2 text-xs font-semibold text-[#1B3FAB] transition-colors hover:bg-[#1B3FAB]/10"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          View Worker
                        </button>

                        <button
                          onClick={() => handleDownloadFiles(p)}
                          disabled={downloadingId === p.id}
                          className={`relative flex min-h-[44px] items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                            p.new_deliverables_count > 0
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {downloadingId === p.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          Download Files
                          {p.new_deliverables_count > 0 && (
                            <span
                              className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm"
                              aria-label={`${p.new_deliverables_count} new deliverable${p.new_deliverables_count === 1 ? "" : "s"}`}
                            >
                              {p.new_deliverables_count}
                            </span>
                          )}
                        </button>

                        {canRequestRevision && (
                          <button
                            onClick={() => {
                              setRevisionProject(p);
                              setRevisionNote("");
                              setRevisionError(null);
                            }}
                            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Request Revision
                          </button>
                        )}

                        {canDispute && (
                          <button
                            onClick={() => {
                              setDisputeProject(p);
                              setDisputeError(null);
                            }}
                            className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Raise Dispute
                          </button>
                        )}

                        {p.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleSecureFunds(p.id)}
                            disabled={securingId === p.id}
                            className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#1B3FAB] px-5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1635A0] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:w-auto sm:justify-start"
                          >
                            {securingId === p.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Securing…
                              </>
                            ) : (
                              <>
                                <Wallet className="h-3.5 w-3.5" />
                                Secure Funds
                              </>
                            )}
                          </button>
                        )}

                        {/* The single primary CTA on this card — only one
                            renders at a time, always the heaviest visual
                            weight, so the "next state" is never ambiguous. */}
                        {canRelease && (
                          <button
                            onClick={() => setPaymentProject(p)}
                            disabled={isCompletingThis}
                            className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto sm:w-auto sm:justify-start"
                          >
                            {isCompletingThis ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Releasing…
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve &amp; Release Payment
                              </>
                            )}
                          </button>
                        )}

                        {p.status === "COMPLETED" && (
                          <Link
                            to={`/invoice?id=${p.id}`}
                            className="ml-auto text-xs font-bold text-[#1B3FAB] hover:underline"
                          >
                            View Invoice
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {liveProjects.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-10 text-center text-sm text-slate-400">
                No active projects right now.
              </div>
            )}
          </div>
        )}

        {historyProjects.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400" style={HEADING_FONT}>
              History
            </h2>
            <div className="space-y-3">
              {historyProjects.map((p) => {
                const myRating = ratingsByProject[p.id];
                const isCancelled = p.status === "CANCELLED";
                return (
                  <div
                    key={p.id}
                    className={`flex flex-col gap-3 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 ${
                      isCancelled ? "border-slate-200 bg-slate-50" : "border-emerald-100 bg-emerald-50/50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar initials={getInitials(p.worker_name)} bg="bg-[#1B3FAB]" size="w-10 h-10" text="text-xs" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0F172A]">{p.title}</p>
                        <p className="text-xs text-slate-500">with {p.worker_name || "a freelancer"}</p>
                      </div>
                    </div>
                    {/* Cancelled projects never had funds secured or a
                        completed deliverable — no invoice/rating/receipt
                        actions make sense here, only a status badge and the
                        option to invite the same worker again. */}
                    {isCancelled ? (
                      <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                          Cancelled
                        </span>
                        <button
                          onClick={() => handleRehire(p)}
                          className="flex items-center gap-1 rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-2.5 py-1 text-xs font-bold text-[#FF6B35] hover:bg-[#FF6B35]/20"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Rehire
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-bold text-emerald-700">{formatINR(p.budget)}</span>

                        {myRating ? (
                          <span className="flex items-center gap-0.5" title={`You rated this ${myRating}/5`}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`h-3.5 w-3.5 ${n <= myRating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                              />
                            ))}
                          </span>
                        ) : (
                          <button
                            onClick={() => setRatingProject(p)}
                            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                          >
                            <Star className="h-3 w-3" />
                            Rate
                          </button>
                        )}

                        <button
                          onClick={() => handleRehire(p)}
                          className="flex items-center gap-1 rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-2.5 py-1 text-xs font-bold text-[#FF6B35] hover:bg-[#FF6B35]/20"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Rehire
                        </button>

                        <Link
                          to={`/invoice?id=${p.id}`}
                          className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          View Invoice
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <WorkerDetailDrawer
        project={workerDrawerProject}
        onClose={() => setWorkerDrawerProject(null)}
      />

      <PaymentApprovalModal
        project={paymentProject}
        isSubmitting={completingId === paymentProject?.id}
        submitError={completeError}
        onClose={() => {
          if (completingId) return;
          setPaymentProject(null);
          setCompleteError(null);
        }}
        onConfirm={handleConfirmPayment}
      />

      <RequestRevisionModal
        project={revisionProject}
        note={revisionNote}
        onNoteChange={setRevisionNote}
        isSubmitting={submittingRevisionId === revisionProject?.id}
        submitError={revisionError}
        onClose={() => {
          if (submittingRevisionId) return;
          setRevisionProject(null);
          setRevisionError(null);
        }}
        onConfirm={handleConfirmRevision}
      />

      <DisputeConfirmModal
        project={disputeProject}
        isSubmitting={submittingDisputeId === disputeProject?.id}
        submitError={disputeError}
        onClose={() => {
          if (submittingDisputeId) return;
          setDisputeProject(null);
          setDisputeError(null);
        }}
        onConfirm={handleConfirmDispute}
      />

      <RatingModal
        project={ratingProject}
        currentUserId={currentUser?.id}
        onClose={() => setRatingProject(null)}
        onRehire={() => {
          handleRehire(ratingProject);
          setRatingProject(null);
        }}
        onRated={(projectId, rating) => setRatingsByProject((prev) => ({ ...prev, [projectId]: rating }))}
      />

      <ApplicantsModal
        project={applicantsProject}
        candidates={applicants}
        isLoading={applicantsLoading}
        respondingId={respondingCandidateId}
        onClose={() => setApplicantsProject(null)}
        onRespond={handleRespondToCandidate}
      />

      {rehireToast && (
        <div className="fixed bottom-6 right-6 z-20 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-bold text-emerald-700 shadow-2xl">
          {rehireToast}
        </div>
      )}
    </div>
  );
}
