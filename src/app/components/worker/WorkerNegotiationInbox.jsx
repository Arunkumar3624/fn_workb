import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  Check,
  Clock3,
  FileText,
  IndianRupee,
  Loader2,
  LockKeyhole,
  MessageSquare,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import DeliverablesPanel from "../shared/DeliverablesPanel";
import { listProjects, updateProjectStatus } from "../../lib/projectsApi";
import { getInitials } from "../../utils/formValidation";
import { ApiError } from "../../lib/apiClient";
import { getSocket } from "../../lib/socketClient";

const ACTIVE_THREAD_STATUSES = new Set(["INVITED", "ACCEPTED", "FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED"]);

function formatINR(amount) {
  return `INR ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function isActiveThread(project) {
  return ACTIVE_THREAD_STATUSES.has(project.status);
}

function formatDuration(deadline) {
  if (!deadline) return "Flexible timeline";
  const ms = new Date(deadline).getTime() - Date.now();
  const days = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  return `${days} day${days === 1 ? "" : "s"}`;
}

function getThreadStatus(project) {
  if (project.status === "INVITED") return { label: "Pending Invite", className: "bg-orange-50 text-orange-700 border-orange-100" };
  if (project.status === "ACCEPTED") return { label: "Negotiating", className: "bg-blue-50 text-blue-700 border-blue-100" };
  if (project.status === "FUNDS_SECURED") return { label: "Escrow Locked", className: "bg-emerald-50 text-emerald-700 border-emerald-100" };
  if (project.status === "WORK_IN_PROGRESS") return { label: "In Progress", className: "bg-slate-100 text-slate-700 border-slate-200" };
  if (project.status === "FILES_SUBMITTED") return { label: "In Review", className: "bg-amber-50 text-amber-700 border-amber-100" };
  if (project.status === "COMPLETED") return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-100" };
  return { label: project.status ?? "Active", className: "bg-slate-100 text-slate-600 border-slate-200" };
}

function seedMessages(project) {
  return [
    {
      id: "business-brief",
      sender: "business",
      text: `Hi, we'd like to invite you to work on "${project.title}". The budget and scope are ready for your review.`,
      time: "10:12 AM",
    },
    {
      id: "worker-question",
      sender: "worker",
      text: "Thanks for the invite. I am reviewing the scope and timeline now.",
      time: "10:14 AM",
    },
    {
      id: "business-confirm",
      sender: "business",
      text: "Perfect. The terms are ready to lock once you accept.",
      time: "10:16 AM",
    },
  ];
}

function MotionPanel({ children, panelKey }) {
  return (
    <motion.div
      key={panelKey}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function FieldPill({ icon: Icon, label, value, dark = false }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm ${
        dark
          ? "border-emerald-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${dark ? "text-emerald-300" : "text-slate-400"}`} />
        <p className={`text-[11px] font-bold uppercase tracking-wide ${dark ? "text-emerald-200" : "text-slate-500"}`}>
          {label}
        </p>
      </div>
      <p className={`mt-1 text-sm font-bold ${dark ? "text-emerald-100" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

// The Inbox List — strictly the scrollable thread list now. Each card is a
// non-button div (a real <button> can't legally nest the "View Details"
// button inside it) that selects the thread on click; "View Details" stops
// propagation so it opens the modal without also switching the active chat.
function ThreadNavigator({ threads, selectedThreadId, onSelect, onViewDetails }) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex-shrink-0 border-b border-slate-200 px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Active Threads</p>
            <h2 className="text-base font-bold text-slate-900">{threads.length} invitation{threads.length === 1 ? "" : "s"}</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            Live
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {threads.map((thread) => {
          const selected = thread.id === selectedThreadId;
          const status = getThreadStatus(thread);
          return (
            <div
              key={thread.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(thread.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(thread.id);
                }
              }}
              className={`mb-2 flex w-full cursor-pointer flex-col gap-2.5 rounded-2xl border p-3 text-left shadow-sm transition ${
                selected
                  ? "border-slate-200 border-l-4 border-l-[#FF6B35] bg-slate-100"
                  : "border-transparent border-l-4 border-l-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex w-full items-center gap-3">
                {thread.business_avatar_url ? (
                  <img
                    src={thread.business_avatar_url}
                    alt={thread.business_name}
                    className="h-10 w-10 flex-shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <Avatar initials={getInitials(thread.business_name)} bg="bg-[#1B3FAB]" size="w-10 h-10" text="text-xs" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{thread.business_name}</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{thread.title}</p>
                </div>
                <span className={`flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewDetails(thread);
                }}
                className="ml-[52px] inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200"
              >
                <FileText className="h-3 w-3" />
                View Details
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function JobDetailsPanel({ project }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Job invitation</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {project.title}
          </h2>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-100">
          <Briefcase className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <FieldPill icon={IndianRupee} label="Budget" value={formatINR(project.budget)} dark />
        <FieldPill icon={Clock3} label="Duration" value={formatDuration(project.deadline)} />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Description</p>
        <p className="mt-2 max-h-44 overflow-y-auto pr-1 text-sm leading-6 text-slate-600 wb-scroll-clean">
          {project.description || "No additional description was provided by the business."}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B3FAB]" />
          <div>
            <p className="text-sm font-bold text-slate-900">Terms stay protected</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Acceptance locks this scope, budget, and timeline into your WorkBridge workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Reference material the business attached at invite time (Post a Job
          / Find Workers) — same admin-approval rule as any other submission. */}
      <div className="mt-5">
        <DeliverablesPanel projectId={project.id} />
      </div>
    </div>
  );
}

// The Details Modal — portaled to document.body so it's never at risk of
// the "ancestor with a lingering CSS transform becomes the containing block
// for position:fixed" trap other overlays in this app hit when nested
// inside a tab's own .wb-tab-enter root (see BusinessProjects.jsx's modals
// for the full writeup of that bug). The close button floats over the
// backdrop rather than sitting inside the card, so it never collides with
// the card's own header content. The card's own scroll keeps working via
// wheel/touch/keyboard — .wb-scroll-clean only hides the visible track.
function JobDetailsModal({ project, onClose, onDecline, onAccept, actionBusy, actionError }) {
  const [confirmingDecline, setConfirmingDecline] = useState(false);

  useEffect(() => {
    setConfirmingDecline(false);
  }, [project?.id]);

  if (!project) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed right-6 top-6 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl wb-scroll-clean"
        onClick={(event) => event.stopPropagation()}
      >
        {actionError && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <MotionPanel panelKey={project.id}>
            <JobDetailsPanel project={project} />
            {project.status === "INVITED" ? (
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={onAccept}
                  disabled={actionBusy}
                  className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-5 py-4 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e85d27] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {actionBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Locking terms…
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="h-4 w-4" />
                      Accept Invitation & Lock Terms
                    </>
                  )}
                </button>
                {confirmingDecline ? (
                  // Declining cancels the project outright — one extra
                  // confirmation click so it can't be triggered by the same
                  // fat-finger tap that was aiming for Accept right above it.
                  <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                    <span className="flex-1 text-xs font-bold text-red-700">Decline this invitation?</span>
                    <button
                      type="button"
                      onClick={onDecline}
                      disabled={actionBusy}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDecline(false)}
                      disabled={actionBusy}
                      className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDecline(true)}
                    disabled={actionBusy}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </button>
                )}
              </div>
            ) : (
              // Already acted on — Accept/Decline only ever make sense once,
              // on a still-INVITED project. Re-opening "View Details" on a
              // thread you've already accepted used to show the exact same
              // Accept button again, as if nothing had happened.
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <Check className="h-4 w-4 flex-shrink-0" />
                You've already accepted this invitation — track it in Active Workspace.
              </div>
            )}
          </MotionPanel>
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}

function MessageBubble({ message }) {
  const isWorker = message.sender === "worker";

  return (
    <div className={`flex ${isWorker ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[72%] ${isWorker ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
            isWorker
              ? "rounded-br-lg bg-[#1B3FAB] text-white"
              : "rounded-bl-lg border border-slate-200 bg-white text-slate-800"
          }`}
        >
          {message.text}
        </div>
        <span className="px-1 text-[11px] font-semibold text-slate-400">{message.time}</span>
      </div>
    </div>
  );
}

// The Right Pane — unconditionally flex-1, fills whatever width the (now
// much narrower) thread list leaves behind.
function ChatPanel({ project, messages, draft, onDraftChange, onSend }) {
  const feedRef = useRef(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, project?.id]);

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-slate-50">
      <header className="sticky top-0 z-10 flex min-h-[72px] flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xl">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Negotiation Chat</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Chat with {project.business_name}</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified client
        </span>
      </header>

      <div ref={feedRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6 wb-scroll-clean">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <form onSubmit={onSend} className="flex-shrink-0 border-t border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-[#1B3FAB] focus-within:ring-4 focus-within:ring-[#1B3FAB]/10">
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Write a message..."
            className="min-h-[42px] flex-1 bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-sm shadow-orange-200 transition hover:bg-[#e85d27] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!draft.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>
  );
}

export default function WorkerNegotiationInbox({ initialProjectId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(initialProjectId ?? null);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [messagesByProject, setMessagesByProject] = useState({});
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    listProjects({ role: "worker" })
      .then((data) => {
        if (cancelled) return;
        const activeThreads = data.filter(isActiveThread);
        setProjects(activeThreads);
        const preferred = activeThreads.find((project) => project.id === initialProjectId)
          ?? activeThreads.find((project) => project.status === "INVITED")
          ?? activeThreads[0]
          ?? null;
        setSelectedThreadId(preferred?.id ?? null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : "Could not load your invitations.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialProjectId]);

  // A brand-new invite from a live socket event — silent refetch, no local
  // toast (WorkerDashboard.jsx already shows one globally for this event;
  // duplicating it here would double up since both are mounted together).
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleProjectEvent = (event) => {
      if (event.type !== "PROJECT_CREATED") return;
      listProjects({ role: "worker" })
        .then((data) => setProjects(data.filter(isActiveThread)))
        .catch(() => {});
    };

    socket.on("project:event", handleProjectEvent);
    return () => socket.off("project:event", handleProjectEvent);
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedThreadId) ?? null,
    [projects, selectedThreadId]
  );

  useEffect(() => {
    setDraft("");
  }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedProject) return;
    setMessagesByProject((current) => {
      if (current[selectedProject.id]) return current;
      return { ...current, [selectedProject.id]: seedMessages(selectedProject) };
    });
  }, [selectedProject]);

  const patchProject = (updated) => {
    setProjects((current) => current.map((project) => (project.id === updated.id ? { ...project, ...updated } : project)));
  };

  // This list is already pre-filtered to "active" statuses (see the fetch
  // effect above), so a project that moves to CANCELLED doesn't belong in
  // it anymore — patching its status in place would leave a stale CANCELLED
  // card sitting in Negotiations until the next full reload. Removing it
  // here is what actually makes it "fade" immediately.
  const removeProject = (id) => {
    const remaining = projects.filter((project) => project.id !== id);
    setProjects(remaining);
    setSelectedThreadId((current) => (current === id ? remaining[0]?.id ?? null : current));
  };

  const openDetails = (project) => {
    setSelectedJobDetails(project);
    setActionError("");
  };

  const closeDetails = () => {
    setSelectedJobDetails(null);
  };

  // One click, one action — no separate "wizard" screen in between. Confirm
  // once, and it's accepted.
  const handleAccept = async () => {
    if (!selectedJobDetails) return;
    setActionBusy(true);
    setActionError("");
    try {
      if (selectedJobDetails.status === "INVITED") {
        const updated = await updateProjectStatus(selectedJobDetails.id, "ACCEPTED");
        patchProject(updated);
      }
      // Bring the just-accepted thread into focus in the chat pane too.
      setSelectedThreadId(selectedJobDetails.id);
      closeDetails();
      setToast("Terms locked. Project moved into your workspace.");
      window.setTimeout(() => setToast(""), 2600);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not lock this invitation.");
    } finally {
      setActionBusy(false);
    }
  };

  // Previously purely cosmetic — closed the modal and showed a toast, but
  // never touched the project's real status, so a "declined" invitation
  // stayed sitting in INVITED forever and never actually disappeared on
  // reload. Now a real CANCELLED transition (already an allowed FSM move
  // from INVITED for either participant — see backend's canTransition).
  const handleDecline = async () => {
    if (!selectedJobDetails) return;
    const declinedId = selectedJobDetails.id;
    setActionBusy(true);
    setActionError("");
    try {
      await updateProjectStatus(declinedId, "CANCELLED");
      removeProject(declinedId);
      closeDetails();
      setToast("Invitation declined.");
      window.setTimeout(() => setToast(""), 2200);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not decline this invitation.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!selectedProject || !draft.trim()) return;
    const message = {
      id: `worker-${Date.now()}`,
      sender: "worker",
      text: draft.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessagesByProject((current) => ({
      ...current,
      [selectedProject.id]: [...(current[selectedProject.id] ?? []), message],
    }));
    setDraft("");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
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

  if (!selectedProject) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-7">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">No active invitations yet</h2>
          <p className="mt-1 text-sm text-slate-500">New business invites will appear here.</p>
        </div>
      </div>
    );
  }

  const messages = messagesByProject[selectedProject.id] ?? [];

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <aside className="flex h-full min-h-0 w-[360px] flex-shrink-0 flex-col border-r border-slate-200 bg-white">
        <ThreadNavigator
          threads={projects}
          selectedThreadId={selectedThreadId}
          onSelect={setSelectedThreadId}
          onViewDetails={openDetails}
        />
      </aside>

      <ChatPanel
        project={selectedProject}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
      />

      <JobDetailsModal
        project={selectedJobDetails}
        onClose={closeDetails}
        onDecline={handleDecline}
        onAccept={handleAccept}
        actionBusy={actionBusy}
        actionError={actionError}
      />

      {toast && (
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-md">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            {toast}
          </span>
        </div>
      )}
    </div>
  );
}
