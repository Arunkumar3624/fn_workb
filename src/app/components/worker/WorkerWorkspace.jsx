import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, Briefcase, History, Send } from "lucide-react";
import CelebrationOverlay from "../common/CelebrationOverlay";
import TimelineTracker from "../shared/TimelineTracker";
import ProjectCompletionHub from "../shared/ProjectCompletionHub";
import DeliverablesPanel from "../shared/DeliverablesPanel";
import { useAuth } from "../../context/AuthContext";
import { listProjects, updateProjectStatus } from "../../lib/projectsApi";
import { submitReview, listReviewsFor } from "../../lib/reviewsApi";
import { PROJECT_STATUS_META, nextProjectStatus } from "../../utils/projectStatus";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { ApiError } from "../../lib/apiClient";

const ACTIVE_STATUSES = new Set(["ACCEPTED", "FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED"]);

export default function WorkerWorkspace() {
  useDocumentTitle("Active Workspace — WorkBridge");
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pipelineTab, setPipelineTab] = useState("tasks");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [existingReview, setExistingReview] = useState(undefined);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let cancelled = false;
    listProjects({ role: "worker" })
      .then((data) => {
        if (cancelled) return;
        setProjects(data);
        const active = data.filter((p) => ACTIVE_STATUSES.has(p.status));
        setSelectedTaskId(active[0]?.id ?? null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your workspace.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tasks = projects.filter((p) => ACTIVE_STATUSES.has(p.status));
  const historyTasks = projects.filter((p) => p.status === "COMPLETED");
  const activeList = pipelineTab === "tasks" ? tasks : historyTasks;
  const selectedTask = activeList.find((task) => task.id === selectedTaskId) ?? null;

  useEffect(() => {
    if (selectedTask?.status !== "COMPLETED") {
      setExistingReview(undefined);
      return;
    }
    let cancelled = false;
    setExistingReview(undefined);
    listReviewsFor(selectedTask.business_id)
      .then((reviews) => {
        if (cancelled) return;
        const mine = reviews.find((r) => r.project_id === selectedTask.id && r.reviewer_id === currentUser?.id);
        setExistingReview(mine ?? null);
      })
      .catch(() => {
        if (!cancelled) setExistingReview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTask?.id, selectedTask?.status, selectedTask?.business_id, currentUser?.id]);

  const handleSelectTask = (id) => setSelectedTaskId(id);

  const handlePipelineTab = (tab) => {
    setPipelineTab(tab);
    const list = tab === "tasks" ? tasks : historyTasks;
    setSelectedTaskId(list[0]?.id ?? null);
  };

  const patchProject = (updated) => {
    setProjects((current) => current.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  };

  // Worker's turn to act (Start Work / Submit Work) — Approve & Release /
  // Secure Funds are business-only and happen from the business dashboard.
  const handleAdvance = async () => {
    if (!selectedTask) return;
    const meta = PROJECT_STATUS_META[selectedTask.status];
    if (meta?.actionBy !== "worker") return;
    const next = nextProjectStatus(selectedTask.status);
    if (!next) return;

    setAdvancing(true);
    setActionError("");
    try {
      const updated = await updateProjectStatus(selectedTask.id, next);
      patchProject(updated);
      setCelebration({
        variant: "milestone",
        title: next === "FILES_SUBMITTED" ? "Files submitted" : "Work started",
        message:
          next === "FILES_SUBMITTED"
            ? `${selectedTask.business_name} has been notified — payment releases once they approve.`
            : `${selectedTask.business_name} can now see this project is underway.`,
      });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not update this project.");
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden overflow-x-hidden bg-slate-50 md:flex-row">
      <aside className="flex max-h-[45vh] min-h-0 w-full flex-col border-b border-slate-200 bg-slate-50 p-4 sm:p-5 md:max-h-none md:w-[35%] md:min-w-[280px] md:max-w-[360px] md:border-b-0 md:border-r">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Pipeline</p>
            <h2 className="text-lg font-semibold text-slate-900">Your active work</h2>
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
            {tasks.length} live
          </div>
        </div>

        <div className="mb-4 flex gap-1 rounded-2xl bg-slate-100 p-1">
          {[
            { id: "tasks", label: "Active Tasks", count: tasks.length, icon: Briefcase },
            { id: "history", label: "History", count: historyTasks.length, icon: History },
          ].map(({ id, label, count, icon: Icon }) => {
            const active = pipelineTab === id;
            return (
              <button
                key={id}
                onClick={() => handlePipelineTab(id)}
                className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold transition-all ${
                  active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-[#ff6b35] text-white" : "bg-slate-200 text-slate-600"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {activeList.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-xs text-slate-400">
              {pipelineTab === "tasks" ? "No active tasks yet." : "No completed projects yet."}
            </div>
          )}
          {activeList.map((task) => {
            const meta = PROJECT_STATUS_META[task.status];
            return (
              <motion.button
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSelectTask(task.id)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedTaskId === task.id
                    ? "border-slate-200 border-l-4 border-l-[#FF6B35] bg-white shadow-sm"
                    : "border-slate-200/80 bg-white/50 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.business_name}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      task.status === "COMPLETED"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {meta?.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">₹{Number(task.budget).toLocaleString("en-IN")}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </aside>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/50">
        {selectedTask?.status === "COMPLETED" ? (
          existingReview === undefined ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
            </div>
          ) : (
            <>
              {reviewError && (
                <div className="m-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{reviewError}</span>
                </div>
              )}
              <ProjectCompletionHub
                perspective="worker"
                counterpartName={selectedTask.business_name}
                amount={Number(selectedTask.budget)}
                review={existingReview}
                onSubmit={async (rating, feedback) => {
                  setReviewError("");
                  try {
                    const created = await submitReview({ projectId: selectedTask.id, rating, feedback });
                    setExistingReview(created);
                  } catch (err) {
                    setReviewError(err instanceof ApiError ? err.message : "Could not submit review.");
                  }
                }}
              />
            </>
          )
        ) : selectedTask ? (
          <>
            <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-200 bg-white p-4 sm:p-6 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {PROJECT_STATUS_META[selectedTask.status]?.label}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {selectedTask.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {selectedTask.business_name}
                    {selectedTask.deadline && ` / Due ${new Date(selectedTask.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <div className="md:text-right">
                    <p className="text-xl font-bold text-slate-900 sm:text-2xl">₹{Number(selectedTask.budget).toLocaleString("en-IN")}</p>
                    {selectedTask.status !== "ACCEPTED" && (
                      <p className="mt-0.5 text-xs font-bold text-emerald-600">Funds Secured</p>
                    )}
                  </div>
                </div>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-40 sm:p-8">
              {actionError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}
              <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Project Lifecycle</h4>
                  <p className="mt-1 text-sm text-slate-500">Connected delivery timeline for payment release.</p>
                </div>
                <span className="self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:self-auto">Secure delivery</span>
              </div>
              <div className="-mx-4 sm:-mx-6">
                <TimelineTracker status={selectedTask.status} />
              </div>
            </motion.div>

              <div className="grid gap-5">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.08 }}>
                <DeliverablesPanel projectId={selectedTask.id} />
              </motion.div>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur sm:bottom-5 sm:left-8 sm:right-8 sm:gap-4 sm:p-4">
              {selectedTask.status === "FILES_SUBMITTED" && (
                <span className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-amber-600 sm:mr-auto">
                  <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-amber-500" />
                  Awaiting business approval &amp; fund release
                </span>
              )}
              {PROJECT_STATUS_META[selectedTask.status]?.actionBy === "worker" && (
                <button
                  onClick={handleAdvance}
                  disabled={advancing}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-8 py-4 font-bold text-white shadow-md shadow-[#FF6B35]/20 transition-all hover:-translate-y-0.5 hover:bg-[#f05b24] sm:w-auto disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <Send className="h-4 w-4" />
                  {advancing ? "Updating…" : PROJECT_STATUS_META[selectedTask.status].nextActionLabel}
                </button>
              )}
            </div>
          </>
        ) : (
          <WorkspaceEmptyState />
        )}
      </main>

      {celebration && (
        <CelebrationOverlay
          variant={celebration.variant}
          title={celebration.title}
          message={celebration.message}
          primaryLabel="Keep Working"
          onPrimary={() => setCelebration(null)}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
}

function WorkspaceEmptyState() {
  return (
    <div className="flex h-full items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Briefcase className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Select a project</h3>
        <p className="mt-2 max-w-xs text-sm text-slate-500">Choose a task from your pipeline to view its delivery workspace.</p>
      </div>
    </div>
  );
}
