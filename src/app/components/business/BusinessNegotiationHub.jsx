import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  FileText,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Avatar from "../shared/Avatar";
import IdentityHeader from "../shared/IdentityHeader";
import { listProjects } from "../../lib/projectsApi";
import { getInitials } from "../../utils/formValidation";
import { ApiError } from "../../lib/apiClient";

// Same "active" definition WorkerNegotiationInbox uses — a negotiation
// thread only makes sense while the project hasn't been completed/
// cancelled/disputed yet.
const ACTIVE_THREAD_STATUSES = new Set(["INVITED", "ACCEPTED", "FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED"]);

const FUNDS_SECURED_STATUSES = new Set(["FUNDS_SECURED", "WORK_IN_PROGRESS", "FILES_SUBMITTED"]);

const STATUS_META = {
  INVITED: { label: "Awaiting Response", tone: "amber" },
  ACCEPTED: { label: "Negotiating", tone: "blue" },
  FUNDS_SECURED: { label: "Escrow Funded", tone: "emerald" },
  WORK_IN_PROGRESS: { label: "In Progress", tone: "blue" },
  FILES_SUBMITTED: { label: "Review Pending", tone: "amber" },
};

const TONE_CLASSES = {
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

function formatINR(amount) {
  return `INR ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDueDate(deadline) {
  if (!deadline) return "Flexible timeline";
  return new Date(deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function getThreadStatus(project) {
  return STATUS_META[project.status] ?? { label: project.status ?? "Active", tone: "blue" };
}

// There's no real persisted chat/messaging backend in this app (the worker
// side's inbox makes the same simplification) — this seeds a single
// business-authored opening line per thread rather than fabricating a
// two-sided conversation and putting words in the real worker's mouth.
// Replying appends to local-only state, same as the worker side.
function seedMessages(project) {
  return [
    {
      id: "business-brief",
      sender: "business",
      body: `Hi ${project.worker_name}, thanks for taking on "${project.title}". Let us know if you have any questions on scope or timeline.`,
      time: "10:12 AM",
    },
  ];
}

function ThreadNavigator({ threads, selectedThreadId, onSelect }) {
  return (
    <aside className="flex h-screen w-[300px] flex-shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-slate-50/80 backdrop-blur-md">
      <div className="border-b border-slate-200 bg-white/70 px-5 py-5 backdrop-blur-md">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Thread Navigator
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            Negotiations
          </h1>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
            {threads.length} Live
          </span>
        </div>

        <div className="mt-5 flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 text-slate-400">
          <Search className="h-4 w-4" />
          <span className="text-sm font-semibold">Search threads</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {threads.map((project) => {
          const selected = project.id === selectedThreadId;
          const status = getThreadStatus(project);

          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onSelect(project.id)}
              className={`mb-3 flex w-full items-center gap-3 rounded-2xl border py-3.5 pl-3 pr-3 text-left transition ${
                selected
                  ? "border-slate-200 border-l-4 border-l-[#FF6B35] bg-white shadow-sm"
                  : "border-transparent border-l-4 border-l-transparent bg-transparent hover:border-slate-200 hover:bg-white/70"
              }`}
            >
              <Avatar initials={getInitials(project.worker_name)} bg="bg-[#1B3FAB]" size="w-10 h-10" text="text-xs" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-black text-slate-900">
                    {project.worker_name}
                  </p>
                  <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                  {project.title}
                </p>
              </div>
              <span className={`flex-shrink-0 rounded-full border px-2 py-1 text-[10px] font-black ${TONE_CLASSES[status.tone]}`}>
                {status.label}
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
    <div className="flex h-screen flex-1 items-center justify-center bg-white px-8">
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

function HubHeader({ thread, onViewContractTerms }) {
  const status = getThreadStatus(thread);
  const fundsSecured = FUNDS_SECURED_STATUSES.has(thread.status);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-5 px-6 py-4">
        <div className="min-w-0 flex-1 [&>div]:border-b-0 [&>div]:bg-transparent [&>div]:px-0 [&>div]:py-0">
          <IdentityHeader
            name={thread.worker_name}
            subtitle={thread.title}
            initials={getInitials(thread.worker_name)}
            avatarBg="bg-[#1B3FAB]"
            verified
            statusPill={{
              text: status.label,
              tone: status.tone,
            }}
          />
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <span
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3.5 text-xs font-black ${
              fundsSecured ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            {fundsSecured ? "Escrow Secure" : "Awaiting Escrow"}
          </span>
          <button
            type="button"
            onClick={() => onViewContractTerms?.(thread)}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-black text-[#FF6B35] shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-100"
          >
            <FileText className="h-4 w-4" />
            View Contract
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          Due {formatDueDate(thread.deadline)}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-[#FF6B35]" />
          {formatINR(thread.budget)}
        </span>
      </div>
    </header>
  );
}

function MessageBubble({ message }) {
  const isBusiness = message.sender === "business";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex ${isBusiness ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[68%] px-5 py-4 shadow-sm ${
          isBusiness
            ? "rounded-3xl rounded-br-none bg-[#FF6B35] text-white shadow-orange-200"
            : "rounded-3xl rounded-bl-none border border-slate-200 bg-white text-slate-800"
        }`}
      >
        <p className="text-sm font-medium leading-6">{message.body}</p>
        <p className={`mt-2 text-[11px] font-bold ${isBusiness ? "text-white/75" : "text-slate-400"}`}>
          {message.time}
        </p>
      </div>
    </motion.div>
  );
}

function ChatContent({ thread, messages }) {
  const feedRef = useRef(null);

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, thread.id]);

  return (
    <div ref={feedRef} className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChatFooter({ draft, onDraftChange, onSend }) {
  return (
    <footer className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-md">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
        className="mx-auto flex max-w-5xl items-center gap-3"
      >
        <button
          type="button"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-orange-200 hover:text-[#FF6B35]"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <label className="flex min-h-[52px] flex-1 items-center rounded-full border border-slate-200 bg-slate-100 px-5 transition focus-within:border-orange-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-100">
          <MessageCircle className="mr-3 h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Type a secure message..."
            className="h-full flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e85d27] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </footer>
  );
}

function FocusHub({ thread, messages, draft, onDraftChange, onSend, onViewContractTerms }) {
  return (
    <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-white">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={thread.id}
          className="flex h-full min-h-0 flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >
          <HubHeader thread={thread} onViewContractTerms={onViewContractTerms} />
          <ChatContent thread={thread} messages={messages} />
          <ChatFooter draft={draft} onDraftChange={onDraftChange} onSend={onSend} />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default function BusinessNegotiationHub({ onFindTalent, onViewContractTerms }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messageLedger, setMessageLedger] = useState({});
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    listProjects({ role: "business" })
      .then((data) => {
        if (cancelled) return;
        const activeThreads = data.filter((p) => ACTIVE_THREAD_STATUSES.has(p.status));
        setProjects(activeThreads);
        setSelectedThreadId((current) => current ?? activeThreads[0]?.id ?? null);
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
  }, []);

  const activeThread = useMemo(
    () => projects.find((project) => project.id === selectedThreadId) ?? null,
    [projects, selectedThreadId]
  );

  useEffect(() => {
    if (!activeThread) return;
    setMessageLedger((current) => {
      if (current[activeThread.id]) return current;
      return { ...current, [activeThread.id]: seedMessages(activeThread) };
    });
  }, [activeThread]);

  const activeMessages = activeThread ? messageLedger[activeThread.id] ?? [] : [];

  const handleSend = () => {
    const body = draft.trim();
    if (!body || !activeThread) return;

    const nextMessage = {
      id: `${activeThread.id}-${Date.now()}`,
      sender: "business",
      body,
      time: new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    };

    setMessageLedger((current) => ({
      ...current,
      [activeThread.id]: [...(current[activeThread.id] ?? []), nextMessage],
    }));
    setDraft("");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF6B35]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-7">
        <div className="flex max-w-md items-start gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm text-red-600 shadow-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <section className="flex h-screen w-full overflow-hidden bg-slate-50">
      <ThreadNavigator
        threads={projects}
        selectedThreadId={activeThread?.id}
        onSelect={(threadId) => {
          setSelectedThreadId(threadId);
          setDraft("");
        }}
      />

      {activeThread ? (
        <FocusHub
          thread={activeThread}
          messages={activeMessages}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          onViewContractTerms={onViewContractTerms}
        />
      ) : (
        <NoThreadSelected hasThreads={projects.length > 0} onFindTalent={onFindTalent} />
      )}
    </section>
  );
}
