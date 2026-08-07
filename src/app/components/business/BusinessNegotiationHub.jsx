import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import IdentityHeader from "../shared/IdentityHeader";
import ChatThread from "../shared/ChatThread";
import { listProjects } from "../../lib/projectsApi";
import { listThreads } from "../../lib/threadsApi";
import { getInitials } from "../../utils/formValidation";
import { ApiError } from "../../lib/apiClient";
import { getSocket } from "../../lib/socketClient";

// A project only ever gets a real chat_threads row once it has a real
// worker_id (see backend's threads.repository.js) — every status below
// always has one, OPEN never does. Extended to include PENDING_RELEASE/
// COMPLETED/CANCELLED — this is the single unified chat inbox across every
// project stage, not just the pre-completion stage the original "active"
// definition implied. Mirrors WorkerNegotiationInbox.jsx.
const ACTIVE_THREAD_STATUSES = new Set([
  "INVITED",
  "ACCEPTED",
  "PENDING_FUNDS",
  "FUNDS_SECURED",
  "WORK_IN_PROGRESS",
  "FILES_SUBMITTED",
  "PENDING_RELEASE",
  "COMPLETED",
  "CANCELLED",
]);
const CLOSED_STATUSES = new Set(["COMPLETED", "CANCELLED"]);

// PENDING_FUNDS deliberately excluded — funds aren't secured yet, only
// submitted for verification (see EscrowFundingDrawer.jsx).
const FUNDS_SECURED_STATUSES = new Set(["FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED", "PENDING_RELEASE"]);

const STATUS_META = {
  INVITED: { label: "Awaiting Response", tone: "amber" },
  ACCEPTED: { label: "Negotiating", tone: "blue" },
  PENDING_FUNDS: { label: "Verifying Funds", tone: "amber" },
  FUNDS_SECURED: { label: "Escrow Funded", tone: "emerald" },
  WORK_IN_PROGRESS: { label: "In Progress", tone: "blue" },
  FILES_SUBMITTED: { label: "Review Pending", tone: "amber" },
  PENDING_RELEASE: { label: "Release Pending", tone: "amber" },
  COMPLETED: { label: "Completed", tone: "emerald" },
  CANCELLED: { label: "Cancelled", tone: "slate" },
};

const TONE_CLASSES = {
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  slate: "border-slate-200 bg-slate-100 text-slate-500",
};

function formatINR(amount) {
  return `INR ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDueDate(deadline) {
  if (!deadline) return "Flexible timeline";
  return new Date(deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function isActiveThread(project) {
  return ACTIVE_THREAD_STATUSES.has(project.status) && Boolean(project.worker_id);
}

function getProjectStatus(project) {
  return STATUS_META[project.status] ?? { label: project.status ?? "Active", tone: "blue" };
}

// One counterparty (a worker) can be behind several projects — this rolls
// the group up into the navigator row's single badge, same rule as
// WorkerNegotiationInbox.jsx's mirror.
function getThreadBadge(group) {
  const activeCount = group.filter((p) => !CLOSED_STATUSES.has(p.status)).length;
  if (activeCount > 0) {
    const tone = group.some((p) => p.status === "INVITED") ? "amber" : "blue";
    return { label: activeCount === 1 ? "Active" : `${activeCount} Active`, tone };
  }
  return { label: "History", tone: "slate" };
}

function ThreadNavigator({ threads, groupsByCounterparty, selectedThreadId, onSelect }) {
  return (
    <aside className="flex h-full w-[300px] flex-shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-slate-50/80 backdrop-blur-md">
      <div className="border-b border-slate-200 bg-white/70 px-5 py-5 backdrop-blur-md">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Thread Navigator
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            Negotiations
          </h1>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
            {threads.length} {threads.length === 1 ? "Conversation" : "Conversations"}
          </span>
        </div>

        <div className="mt-5 flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 text-slate-400">
          <Search className="h-4 w-4" />
          <span className="text-sm font-semibold">Search threads</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {threads.map((thread) => {
          const selected = thread.id === selectedThreadId;
          const group = groupsByCounterparty.get(thread.other_user_id) ?? [];
          const badge = getThreadBadge(group);
          const preview = thread.last_message_body || "No messages yet";

          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelect(thread.id)}
              className={`mb-3 flex w-full items-center gap-3 rounded-2xl border py-3.5 pl-3 pr-3 text-left transition ${
                selected
                  ? "border-slate-200 border-l-4 border-l-[#FF6B35] bg-white shadow-sm"
                  : "border-transparent border-l-4 border-l-transparent bg-transparent hover:border-slate-200 hover:bg-white/70"
              }`}
            >
              {thread.other_avatar_url ? (
                <img
                  src={thread.other_avatar_url}
                  alt={thread.other_name}
                  className="h-10 w-10 flex-shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <Avatar initials={getInitials(thread.other_name)} bg="bg-[#1B3FAB]" size="w-10 h-10" text="text-xs" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-black text-slate-900">
                    {thread.other_name}
                  </p>
                  <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                  {preview}
                </p>
              </div>
              <span className={`flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-black ${TONE_CLASSES[badge.tone]}`}>
                {badge.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function NoThreadSelected({ hasThreads, onFindTalent }) {
  return (
    <div className="flex h-full flex-1 items-center justify-center bg-white px-8">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-orange-100 bg-slate-50 shadow-sm">
          <Users className="h-11 w-11 text-[#FF6B35]" />
        </div>
        <h2 className="mt-7 text-2xl font-black tracking-tight text-slate-900">
          {hasThreads ? "Select a conversation to begin" : "No active negotiations"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {hasThreads
            ? "Choose a worker thread from the navigator to review contract status and continue the conversation."
            : "Browse candidates to get started. Once you invite a worker, the secure negotiation thread will appear here."}
        </p>
        {!hasThreads && (
          <button
            type="button"
            onClick={onFindTalent}
            className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-6 text-sm font-black text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e85d27]"
          >
            <Search className="h-4 w-4" />
            Find Talent
          </button>
        )}
      </div>
    </div>
  );
}

// One project chip per real project with this worker — active ones full
// contrast, closed ones muted but still clickable. Replaced the old header's
// single project's budget/deadline/escrow strip, which no longer makes
// sense once one merged conversation can span several projects at once.
function ProjectChip({ project, onClick }) {
  const status = getProjectStatus(project);
  const isClosed = CLOSED_STATUSES.has(project.status);
  return (
    <button
      type="button"
      onClick={() => onClick(project)}
      className={`flex flex-shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
        isClosed ? "border-slate-200 bg-white/60 opacity-70" : "border-slate-200 bg-white/80 shadow-sm"
      }`}
    >
      <FileText className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="max-w-[140px] truncate text-xs font-bold text-slate-900">{project.title}</p>
        <span className={`mt-0.5 inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${TONE_CLASSES[status.tone]}`}>
          {status.label}
        </span>
      </div>
    </button>
  );
}

function HubHeader({ thread, projects, onViewContractTerms }) {
  const mostUrgent = projects.find((p) => !CLOSED_STATUSES.has(p.status)) ?? projects[0] ?? null;
  const fundsSecured = mostUrgent ? FUNDS_SECURED_STATUSES.has(mostUrgent.status) : false;
  const isPaidOut = mostUrgent?.status === "COMPLETED";
  const isCancelled = mostUrgent?.status === "CANCELLED";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-5 px-6 py-4">
        <div className="min-w-0 flex-1 [&>div]:border-b-0 [&>div]:bg-transparent [&>div]:px-0 [&>div]:py-0">
          <IdentityHeader
            name={thread.other_name}
            subtitle={projects.length === 1 ? projects[0].title : `${projects.length} projects together`}
            initials={getInitials(thread.other_name)}
            avatarBg="bg-[#1B3FAB]"
            verified
          />
        </div>

        {mostUrgent && (
          <div className="flex flex-shrink-0 items-center gap-3">
            <span
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3.5 text-xs font-black ${
                isCancelled
                  ? "border-slate-200 bg-slate-100 text-slate-500"
                  : isPaidOut || fundsSecured
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              {isCancelled ? "Cancelled" : isPaidOut ? "Paid Out" : fundsSecured ? "Escrow Secure" : "Awaiting Escrow"}
            </span>
            <button
              type="button"
              onClick={() => onViewContractTerms?.(mostUrgent)}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-black text-[#FF6B35] shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-100"
            >
              <FileText className="h-4 w-4" />
              View Contract
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {mostUrgent && (
        <div className="flex flex-wrap items-center gap-3 px-6 pb-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            Due {formatDueDate(mostUrgent.deadline)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-[#FF6B35]" />
            {formatINR(mostUrgent.budget)}
          </span>
        </div>
      )}

      {projects.length > 0 && (
        <div className="wb-scroll-clean flex gap-2 overflow-x-auto px-6 pb-4">
          {projects.map((project) => (
            <ProjectChip key={project.id} project={project} onClick={onViewContractTerms} />
          ))}
        </div>
      )}
    </header>
  );
}

// The feed/composer are ChatThread (shared/ChatThread.jsx) — a real,
// persisted conversation that spans every project with this worker, not
// just one.
function FocusHub({ thread, projects, onViewContractTerms }) {
  const activeProjects = useMemo(() => projects.filter((p) => !CLOSED_STATUSES.has(p.status)), [projects]);

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={thread.id}
          className="flex h-full min-h-0 flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >
          <HubHeader thread={thread} projects={projects} onViewContractTerms={onViewContractTerms} />
          {/* No longer read-only once closed — see WorkerNegotiationInbox.jsx's
              matching comment. Only a real, mutual, WhatsApp-style block
              gates the composer now. */}
          <ChatThread
            threadId={thread.id}
            otherUserId={thread.other_user_id}
            activeProjects={activeProjects.map((p) => ({ id: p.id, title: p.title }))}
            projectIds={projects.map((p) => p.id)}
          />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default function BusinessNegotiationHub({ onFindTalent, onViewContractTerms, initialProjectId }) {
  const [threads, setThreads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listThreads(), listProjects({ role: "business" })])
      .then(([threadsData, projectsData]) => {
        if (cancelled) return;
        setThreads(threadsData);
        setProjects(projectsData);
        setSelectedThreadId((current) => {
          if (current) return current;
          const initialProject = projectsData.find((p) => p.id === initialProjectId);
          const preferred =
            (initialProject && threadsData.find((t) => t.other_user_id === initialProject.worker_id)) ??
            threadsData[0] ??
            null;
          return preferred?.id ?? null;
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your negotiations.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialProjectId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleProjectEvent = (event) => {
      if (event.type === "MESSAGE_CREATED") {
        listThreads().then(setThreads).catch(() => {});
      } else if (event.type === "CANDIDATE_ACCEPTED") {
        Promise.all([listThreads(), listProjects({ role: "business" })])
          .then(([t, p]) => {
            setThreads(t);
            setProjects(p);
          })
          .catch(() => {});
      }
    };

    socket.on("project:event", handleProjectEvent);
    return () => socket.off("project:event", handleProjectEvent);
  }, []);

  // One counterparty (a worker) can be behind several projects — grouped
  // client-side from the same real project list Projects/Workers already
  // use, keyed by worker_id.
  const projectsByCounterparty = useMemo(() => {
    const map = new Map();
    for (const project of projects) {
      if (!isActiveThread(project)) continue;
      if (!map.has(project.worker_id)) map.set(project.worker_id, []);
      map.get(project.worker_id).push(project);
    }
    return map;
  }, [projects]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId]
  );
  const activeGroup = activeThread ? projectsByCounterparty.get(activeThread.other_user_id) ?? [] : [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-7">
        <div className="flex max-w-md items-start gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm text-red-600 shadow-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <section className="flex h-full w-full overflow-hidden bg-slate-50">
      <ThreadNavigator
        threads={threads}
        groupsByCounterparty={projectsByCounterparty}
        selectedThreadId={activeThread?.id}
        onSelect={setSelectedThreadId}
      />

      {activeThread ? (
        <FocusHub thread={activeThread} projects={activeGroup} onViewContractTerms={onViewContractTerms} />
      ) : (
        <NoThreadSelected hasThreads={threads.length > 0} onFindTalent={onFindTalent} />
      )}
    </section>
  );
}
