import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Star,
  UserCheck,
  Wallet,
  X,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import TimelineTracker from "../shared/TimelineTracker";
import ProjectCompletionHub from "../shared/ProjectCompletionHub";
import DeliverablesPanel from "../shared/DeliverablesPanel";
import { PROJECT_STATUS_META } from "../../utils/projectStatus";
import {
  listBusinessProjects,
  completeProject as apiCompleteProject,
  secureFunds as apiSecureFunds,
  createProject,
} from "../../lib/projectsApi";
import { getPublicProfile } from "../../lib/profilesApi";
import { submitReview, listReviewsFor } from "../../lib/reviewsApi";
import { getInitials } from "../../utils/formValidation";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const HEADING_FONT = { fontFamily: "'Lexend', sans-serif" };
const DATA_FONT = { fontFamily: "'Inter', sans-serif" };

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
            className="absolute right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col bg-white/90 shadow-2xl backdrop-blur-xl"
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
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Payment approval modal ──────────────────────────────────────────────────
function PaymentApprovalModal({ project, isSubmitting, submitError, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
    </AnimatePresence>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
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
            }}
            onRehire={onRehire}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function BusinessProjects() {
  useDocumentTitle("Active Projects — WorkBridge Business");
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [frozenProjects, setFrozenProjects] = useState(new Set());
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

  const liveProjects = projects.filter((p) => p.status !== "COMPLETED");
  const historyProjects = projects.filter((p) => p.status === "COMPLETED");

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

  const toggleFreeze = (id) => {
    setFrozenProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
                const isFrozen = frozenProjects.has(p.id);
                const meta = p.status ? PROJECT_STATUS_META[p.status] : null;
                const canRelease = p.status === "FILES_SUBMITTED" && !isFrozen;
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
                      isFrozen ? "border-red-200 shadow-sm shadow-red-100/60" : "border-slate-200 hover:shadow-md"
                    }`}
                  >
                    {isFrozen && (
                      <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-5 py-2.5">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                        <p className="text-xs font-bold text-red-600">
                          Funds frozen · Payment is paused. Contact the worker to resolve the issue before unfreezing.
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
                          aria-label={`Project status: ${isFrozen ? "Frozen" : meta?.label ?? "Pending"}`}
                          className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                            isFrozen ? "border border-red-200 bg-red-50 text-red-600" : "border border-blue-100 bg-blue-50 text-blue-700"
                          }`}
                        >
                          {isFrozen ? "Frozen" : meta?.label ?? "Pending"}
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

                        <button className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                          <Download className="h-3.5 w-3.5" />
                          Download Files
                        </button>

                        <button
                          onClick={() => toggleFreeze(p.id)}
                          className={`flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                            isFrozen
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {isFrozen ? "Unfreeze Funds" : "Freeze Funds"}
                        </button>

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
                          <a
                            href={`/invoice?role=business&id=${p.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto text-xs font-bold text-[#1B3FAB] hover:underline"
                          >
                            View Invoice
                          </a>
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
                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar initials={getInitials(p.worker_name)} bg="bg-[#1B3FAB]" size="w-10 h-10" text="text-xs" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#0F172A]">{p.title}</p>
                        <p className="text-xs text-slate-500">with {p.worker_name || "a freelancer"}</p>
                      </div>
                    </div>
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

                      <a
                        href={`/invoice?role=business&id=${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        View Invoice
                      </a>
                    </div>
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

      {rehireToast && (
        <div className="fixed bottom-6 right-6 z-20 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-bold text-emerald-700 shadow-2xl">
          {rehireToast}
        </div>
      )}
    </div>
  );
}
