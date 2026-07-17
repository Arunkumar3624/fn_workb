import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  FileText,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import IdentityHeader from "../shared/IdentityHeader";
import { getInitials } from "../../utils/formValidation";

const DEFAULT_THREADS = [
  {
    id: "thread-rahul-fin-edge",
    workerName: "Rahul K.",
    workerTitle: "Frontend Specialist",
    company: "FinEdge India",
    projectTitle: "Portfolio Analytics Dashboard",
    avatarBg: "bg-[#1B3FAB]",
    status: "Escrow Funded",
    escrowStatus: "Escrow Secure",
    budget: "INR 45,000",
    messages: [
      {
        id: "rk-1",
        sender: "worker",
        body: "Please make the portfolio chart interactive with hover tooltips.",
        time: "10:24 AM",
      },
      {
        id: "rk-2",
        sender: "business",
        body: "Done! Uploading the updated build now.",
        time: "10:31 AM",
      },
      {
        id: "rk-3",
        sender: "worker",
        body: "Looks great. Awaiting final files before we release payment.",
        time: "10:35 AM",
      },
    ],
  },
  {
    id: "thread-meena-growthpilot",
    workerName: "Meena S.",
    workerTitle: "Conversion Designer",
    company: "GrowthPilot",
    projectTitle: "Landing Page Redesign",
    avatarBg: "bg-[#FF6B35]",
    status: "Negotiating",
    escrowStatus: "Escrow Secure",
    budget: "INR 28,000",
    messages: [
      {
        id: "ms-1",
        sender: "worker",
        body: "I can deliver the hero and pricing section by tomorrow evening.",
        time: "9:41 AM",
      },
      {
        id: "ms-2",
        sender: "business",
        body: "Perfect. Keep the CTA orange and the trust cards clean.",
        time: "9:45 AM",
      },
    ],
  },
  {
    id: "thread-priti-nourish",
    workerName: "Priti D.",
    workerTitle: "Brand Illustrator",
    company: "Nourish Co.",
    projectTitle: "Wellness App Illustrations",
    avatarBg: "bg-emerald-600",
    status: "Escrow Funded",
    escrowStatus: "Escrow Secure",
    budget: "INR 36,500",
    messages: [
      {
        id: "pd-1",
        sender: "worker",
        body: "Perfect, talk then! Super excited about this project.",
        time: "10:00 AM",
      },
      {
        id: "pd-2",
        sender: "business",
        body: "Same here. We will review the first moodboard today.",
        time: "10:04 AM",
      },
    ],
  },
];

function buildMessageLedger(threads) {
  return threads.reduce((ledger, thread) => {
    ledger[thread.id] = thread.messages ?? [];
    return ledger;
  }, {});
}

function getStatusTone(status) {
  if (status?.toLowerCase().includes("escrow")) return "emerald";
  if (status?.toLowerCase().includes("negotiating")) return "blue";
  return "amber";
}

function WorkerAvatar({ thread }) {
  return (
    <div
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
        thread.avatarBg ?? "bg-[#1B3FAB]"
      } text-sm font-black text-white shadow-sm`}
    >
      {getInitials(thread.workerName)}
    </div>
  );
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
        {threads.map((thread) => {
          const selected = thread.id === selectedThreadId;

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
              <WorkerAvatar thread={thread} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-black text-slate-900">
                    {thread.workerName}
                  </p>
                  <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                  {thread.projectTitle}
                </p>
              </div>
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
            : "Browse candidates to get started. When a worker replies, the secure negotiation thread will appear here."}
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
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-5 px-6 py-4">
        <div className="min-w-0 flex-1 [&>div]:border-b-0 [&>div]:bg-transparent [&>div]:px-0 [&>div]:py-0">
          <IdentityHeader
            name={thread.workerName}
            subtitle={`${thread.workerTitle} · ${thread.projectTitle}`}
            initials={getInitials(thread.workerName)}
            avatarBg={thread.avatarBg}
            verified
            statusPill={{
              text: thread.status,
              tone: getStatusTone(thread.status),
            }}
          />
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3.5 text-xs font-black text-green-700">
            <ShieldCheck className="h-4 w-4" />
            {thread.escrowStatus ?? "Escrow Secure"}
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
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          {thread.company}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-[#FF6B35]" />
          {thread.budget}
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

export default function BusinessNegotiationHub({
  threads = DEFAULT_THREADS,
  onFindTalent,
  onViewContractTerms,
}) {
  const safeThreads = useMemo(() => (Array.isArray(threads) ? threads : []), [threads]);
  const [selectedThreadId, setSelectedThreadId] = useState(safeThreads[0]?.id ?? null);
  const [messageLedger, setMessageLedger] = useState(() => buildMessageLedger(safeThreads));
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setMessageLedger((current) => {
      const next = { ...current };
      safeThreads.forEach((thread) => {
        if (!next[thread.id]) next[thread.id] = thread.messages ?? [];
      });
      return next;
    });

    if (!safeThreads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(safeThreads[0]?.id ?? null);
    }
  }, [safeThreads, selectedThreadId]);

  const activeThread = safeThreads.find((thread) => thread.id === selectedThreadId) ?? null;
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

  return (
    <section className="flex h-screen w-full overflow-hidden bg-slate-50">
      <ThreadNavigator
        threads={safeThreads}
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
        <NoThreadSelected hasThreads={safeThreads.length > 0} onFindTalent={onFindTalent} />
      )}
    </section>
  );
}
