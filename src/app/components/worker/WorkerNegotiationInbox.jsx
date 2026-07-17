import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeftRight,
  BadgeCheck,
  Briefcase,
  Check,
  Clock3,
  IndianRupee,
  LockKeyhole,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import IdentityHeader from "../shared/IdentityHeader";
import { listProjects, updateProjectStatus } from "../../lib/projectsApi";
import { getPublicProfile } from "../../lib/profilesApi";
import { getInitials } from "../../utils/formValidation";
import { ApiError } from "../../lib/apiClient";

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
      initial={{ opacity: 0, x: 34 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -34 }}
      transition={{ duration: 0.34, ease: "easeInOut" }}
      className="h-full min-h-0"
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
      <p className={`mt-1 text-sm font-black ${dark ? "text-emerald-100" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function ThreadNavigator({ threads, selectedThreadId, onSelect }) {
  return (
    <section className="flex h-[22%] min-h-[158px] flex-shrink-0 flex-col border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Active Threads</p>
          <h2 className="text-base font-black text-slate-900">{threads.length} invitation{threads.length === 1 ? "" : "s"}</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-black text-slate-500">
          Live
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {threads.map((thread) => {
          const selected = thread.id === selectedThreadId;
          const status = getThreadStatus(thread);
          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelect(thread.id)}
              className={`mb-2 flex w-full items-center gap-3 rounded-2xl border py-3 pl-3 pr-3 text-left shadow-sm transition ${
                selected
                  ? "border-slate-200 border-l-4 border-l-[#FF6B35] bg-slate-100"
                  : "border-transparent border-l-4 border-l-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
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
                <p className="truncate text-xs font-black text-slate-900">{thread.business_name}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{thread.title}</p>
              </div>
              <span className={`flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-black ${status.className}`}>
                {status.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function JobDetailsPanel({ project, onAccept, onDecline, actionBusy }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Job invitation</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
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
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Description</p>
            <p className="mt-2 max-h-44 overflow-y-auto pr-1 text-sm leading-6 text-slate-600">
              {project.description || "No additional description was provided by the business."}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1B3FAB]" />
              <div>
                <p className="text-sm font-black text-slate-900">Terms stay protected</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Acceptance locks this scope, budget, and timeline into your WorkBridge workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex-shrink-0 space-y-3">
        <button
          type="button"
          onClick={onAccept}
          disabled={actionBusy}
          className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-5 py-4 text-sm font-black text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e85d27] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <LockKeyhole className="h-4 w-4" />
          Accept Invitation & Lock Terms
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
          Decline
        </button>
      </div>
    </div>
  );
}

function WizardStep({ index, title, description, state }) {
  const isDone = state === "done";
  const isActive = state === "active";

  return (
    <div className="relative flex gap-4">
      {index < 3 && <div className="absolute left-5 top-11 h-[calc(100%-1.25rem)] w-px bg-slate-200" />}
      <div
        className={`z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border text-sm font-black shadow-sm ${
          isDone
            ? "border-emerald-200 bg-emerald-500 text-white"
            : isActive
              ? "border-orange-200 bg-orange-50 text-[#FF6B35]"
              : "border-slate-200 bg-white text-slate-400"
        }`}
      >
        {isDone ? <Check className="h-5 w-5" /> : index}
      </div>
      <div className={`rounded-2xl border p-4 shadow-sm ${isActive ? "border-orange-200 bg-orange-50/70" : "border-slate-200 bg-white"}`}>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function AcceptWizardPanel({ project, onBack, onStart, actionBusy }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex w-fit items-center gap-2 rounded-xl px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        Back to invitation
      </button>

      <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A1128] text-white">
            <Sparkles className="h-5 w-5 text-[#FF6B35]" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#1B3FAB]">Lock terms</p>
            <h2 className="text-xl font-black text-slate-900">Acceptance wizard</h2>
          </div>
        </div>

        <div className="space-y-4">
          <WizardStep
            index={1}
            title="Review Scope"
            description={`Scope reviewed for "${project.title}". Budget, timeline, and deliverables are attached to this invite.`}
            state="done"
          />
          <WizardStep
            index={2}
            title="Confirm Escrow Lock"
            description="The funded terms are protected in WorkBridge escrow before work moves into the active workspace."
            state="active"
          />
          <div className="relative flex gap-4">
            <div className="z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-500 shadow-sm">
              3
            </div>
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-slate-900">Start Project</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Finalize acceptance and move this project into your active workspace.
              </p>
              <button
                type="button"
                onClick={onStart}
                disabled={actionBusy}
                className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1B3FAB] px-5 py-3 text-sm font-black text-white shadow-md shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-[#173795] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <Zap className="h-4 w-4" />
                {actionBusy ? "Finalizing..." : "Start Project ⚡"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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

function ChatPanel({ project, messages, draft, onDraftChange, onSend }) {
  const feedRef = useRef(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, project?.id]);

  return (
    <section className="flex h-full min-h-0 w-[60%] flex-col bg-slate-50">
      <header className="sticky top-0 z-10 flex min-h-[72px] flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xl">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Negotiation Chat</p>
          <h2 className="mt-1 text-lg font-black text-slate-900">Chat with {project.business_name}</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified client
        </span>
      </header>

      <div ref={feedRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
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
  const [panelMode, setPanelMode] = useState("details");
  const [actionBusy, setActionBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [businessProfile, setBusinessProfile] = useState(null);
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

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedThreadId) ?? null,
    [projects, selectedThreadId]
  );

  useEffect(() => {
    setPanelMode("details");
    setActionError("");
    setDraft("");
  }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedProject) return;
    setMessagesByProject((current) => {
      if (current[selectedProject.id]) return current;
      return { ...current, [selectedProject.id]: seedMessages(selectedProject) };
    });
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject?.business_id) return;
    let cancelled = false;
    setBusinessProfile(null);
    getPublicProfile(selectedProject.business_id)
      .then((profile) => {
        if (!cancelled) setBusinessProfile(profile);
      })
      .catch(() => {
        if (!cancelled) setBusinessProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProject?.business_id]);

  const patchProject = (updated) => {
    setProjects((current) => current.map((project) => (project.id === updated.id ? { ...project, ...updated } : project)));
  };

  const handleStartProject = async () => {
    if (!selectedProject) return;
    setActionBusy(true);
    setActionError("");
    try {
      if (selectedProject.status === "INVITED") {
        const updated = await updateProjectStatus(selectedProject.id, "ACCEPTED");
        patchProject(updated);
      }
      setPanelMode("details");
      setToast("Terms locked. Project moved into your workspace.");
      window.setTimeout(() => setToast(""), 2600);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not lock this invitation.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleDecline = () => {
    setToast("Invitation declined for now.");
    window.setTimeout(() => setToast(""), 2200);
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
          <h2 className="mt-4 text-lg font-black text-slate-900">No active invitations yet</h2>
          <p className="mt-1 text-sm text-slate-500">New business invites will appear here.</p>
        </div>
      </div>
    );
  }

  const messages = messagesByProject[selectedProject.id] ?? [];

  return (
    <div className="relative flex h-full min-h-0 overflow-hidden bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <aside className="flex h-full min-h-0 w-[40%] min-w-[380px] flex-col border-r border-slate-200 bg-white">
        <ThreadNavigator
          threads={projects}
          selectedThreadId={selectedThreadId}
          onSelect={setSelectedThreadId}
        />

        <section className="flex min-h-0 flex-1 flex-col bg-white">
          <IdentityHeader
            name={selectedProject.business_name}
            subtitle={selectedProject.title}
            initials={getInitials(selectedProject.business_name)}
            avatarUrl={selectedProject.business_avatar_url}
            verified={businessProfile?.verified ?? true}
            rating={businessProfile?.rating}
            reviews={businessProfile?.reviews_count}
          />

          {actionError && (
            <div className="mx-5 mt-4 flex flex-shrink-0 items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden p-5">
            <AnimatePresence mode="wait" initial={false}>
              {panelMode === "details" ? (
                <MotionPanel panelKey={`details-${selectedProject.id}`}>
                  <JobDetailsPanel
                    project={selectedProject}
                    onAccept={() => setPanelMode("wizard")}
                    onDecline={handleDecline}
                    actionBusy={actionBusy}
                  />
                </MotionPanel>
              ) : (
                <MotionPanel panelKey={`wizard-${selectedProject.id}`}>
                  <AcceptWizardPanel
                    project={selectedProject}
                    onBack={() => setPanelMode("details")}
                    onStart={handleStartProject}
                    actionBusy={actionBusy}
                  />
                </MotionPanel>
              )}
            </AnimatePresence>
          </div>
        </section>
      </aside>

      <ChatPanel
        project={selectedProject}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
      />

      {toast && (
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-emerald-700 shadow-md">
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            {toast}
          </span>
        </div>
      )}
    </div>
  );
}
