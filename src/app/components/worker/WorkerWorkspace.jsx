import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Briefcase,
  ChevronLeft,
  FileText,
  History,
  Search,
  Send,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";
import { usePlatformData } from "../../context/PlatformContext";
import CelebrationOverlay from "../common/CelebrationOverlay";
import TimelineTracker from "../shared/TimelineTracker";
import ProjectCompletionHub from "../shared/ProjectCompletionHub";
import { PROJECT_STATUS_META, nextProjectStatus, parseAmount } from "../../utils/projectStatus";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

// Identity map for the legacy SecureChatEngine below — it reads messagesDb
// directly (task-1/2/3 threads), which predates and is independent of the
// Project Lifecycle FSM. Kept minimal on purpose: no status/budget here.
export const SECURE_CHAT_CONVERSATIONS = [
  { id: 1, threadId: "task-1", clientId: "client-finedge", clientName: "Rahul K.", clientAvatar: "RK", company: "FinEdge India", title: "React Dashboard Build" },
  { id: 2, threadId: "task-2", clientId: "client-growthpilot", clientName: "Meena S.", clientAvatar: "MS", company: "GrowthPilot", title: "SEO Content Sprint" },
  { id: 3, threadId: "task-3", clientId: "client-nourish", clientName: "Priti D.", clientAvatar: "PD", company: "Nourish Co.", title: "Brand Identity Package" },
];

export default function WorkerWorkspace() {
  useDocumentTitle("Active Workspace — WorkBridge");
  const { invitesDb, advanceInviteStatus, submitRating } = usePlatformData();
  const [pipelineTab, setPipelineTab] = useState("tasks");
  const [celebration, setCelebration] = useState(null);

  const tasks = invitesDb.filter((i) => i.isAccepted && i.projectStatus && i.projectStatus !== "COMPLETED");
  const historyTasks = invitesDb.filter((i) => i.projectStatus === "COMPLETED");

  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id ?? null);

  const activeList = pipelineTab === "tasks" ? tasks : historyTasks;
  const selectedTask = activeList.find((task) => task.id === selectedTaskId) ?? null;

  const handleSelectTask = (id) => setSelectedTaskId(id);

  const handlePipelineTab = (tab) => {
    setPipelineTab(tab);
    const list = tab === "tasks" ? tasks : historyTasks;
    setSelectedTaskId(list[0]?.id ?? null);
  };

  // Worker's turn to act (Start Work / Submit Work) — Approve & Release is
  // business-only and happens over on the Business Inbox side.
  const handleAdvance = () => {
    if (!selectedTask?.projectStatus) return;
    const meta = PROJECT_STATUS_META[selectedTask.projectStatus];
    if (meta?.actionBy !== "worker") return;
    const next = nextProjectStatus(selectedTask.projectStatus);
    advanceInviteStatus(selectedTask.id, next);
    setCelebration({
      variant: "milestone",
      title: next === "FILES_SUBMITTED" ? "Files submitted" : "Work started",
      message:
        next === "FILES_SUBMITTED"
          ? `${selectedTask.businessName} has been notified — payment releases once they approve.`
          : `${selectedTask.businessName} can now see this project is underway.`,
    });
  };

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
            const meta = PROJECT_STATUS_META[task.projectStatus];
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
                    <p className="truncate text-sm font-semibold text-slate-900">{task.jobTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.businessName}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      task.projectStatus === "COMPLETED"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {meta?.label}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{task.budget}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </aside>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/50">
        {selectedTask?.projectStatus === "COMPLETED" ? (
          <ProjectCompletionHub
            perspective="worker"
            counterpartName={selectedTask.businessName}
            amount={parseAmount(selectedTask.budget)}
            review={selectedTask.review}
            onSubmit={(rating, feedback) => submitRating(selectedTask.id, rating, feedback)}
          />
        ) : selectedTask ? (
          <>
            <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-200 bg-white p-4 sm:p-6 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {PROJECT_STATUS_META[selectedTask.projectStatus]?.label}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {selectedTask.jobTitle}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {selectedTask.businessName} / Due {selectedTask.deadline}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <div className="md:text-right">
                    <p className="text-xl font-bold text-slate-900 sm:text-2xl">{selectedTask.budget}</p>
                    <p className="mt-0.5 text-xs font-bold text-emerald-600">Funds Secured</p>
                  </div>
                </div>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-4 pb-40 sm:p-8">
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
                <TimelineTracker status={selectedTask.projectStatus} />
              </div>
            </motion.div>

              <div className="grid gap-5">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.08 }}>
                <FileBlock task={selectedTask} />
              </motion.div>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur sm:bottom-5 sm:left-8 sm:right-8 sm:gap-4 sm:p-4">
              {selectedTask.projectStatus === "FILES_SUBMITTED" && (
                <span className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-amber-600 sm:mr-auto">
                  <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-amber-500" />
                  Awaiting business approval &amp; fund release
                </span>
              )}
              {PROJECT_STATUS_META[selectedTask.projectStatus]?.actionBy === "worker" && (
                <button
                  onClick={handleAdvance}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-8 py-4 font-bold text-white shadow-md shadow-[#FF6B35]/20 transition-all hover:-translate-y-0.5 hover:bg-[#f05b24] sm:w-auto"
                >
                  <Send className="h-4 w-4" />
                  {PROJECT_STATUS_META[selectedTask.projectStatus].nextActionLabel}
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

function FileBlock({ task }) {
  const files = task.files ?? [];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 shadow-sm">
          <FileText className="h-5 w-5 text-[#0f172a]" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">File Management &amp; Submission</h4>
          <p className="text-sm text-slate-500">Upload your finished work to trigger payment release.</p>
        </div>
      </div>

      <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors hover:bg-slate-100">
        <Upload className="mx-auto mb-3 h-7 w-7 text-slate-400" />
        <p className="text-sm font-semibold text-slate-700">Drop files here or browse</p>
        <p className="mt-1 text-xs text-slate-500">ZIP, PDF, Figma, images / max 500 MB</p>
      </div>

      <div className="mt-4 space-y-2">
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.name} className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-[#FF6B35]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-500">{file.size} / uploaded {file.date}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
            No files uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}

export function SecureChatEngine({ conversations, selectedThreadId, onSelectConversation, onBack }) {
  const { messagesDb, addMessage } = usePlatformData();
  const [activeThreadId, setActiveThreadId] = useState(selectedThreadId);
  const [searchQuery, setSearchQuery] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const messagesEndRef = useRef(null);
  const workerChatId = "worker-priya";

  useEffect(() => {
    setActiveThreadId(selectedThreadId);
  }, [selectedThreadId]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.threadId === activeThreadId) ?? conversations[0],
    [activeThreadId, conversations]
  );

  const messagesByThread = useMemo(() => {
    return messagesDb.reduce((threads, message) => {
      if (!threads[message.threadId]) threads[message.threadId] = [];
      threads[message.threadId].push(message);
      return threads;
    }, {});
  }, [messagesDb]);

  const activeMessages = useMemo(() => {
    return [...(messagesByThread[activeConversation?.threadId] ?? [])].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [activeConversation?.threadId, messagesByThread]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const lastMessage = getLastMessage(messagesByThread[conversation.threadId]);
      return [conversation.clientName, conversation.company, conversation.title, lastMessage?.text]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [conversations, messagesByThread, searchQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, activeThreadId]);

  const handleSelectThread = (conversation) => {
    setActiveThreadId(conversation.threadId);
    onSelectConversation?.(conversation.id);
  };

  const handleSendMessage = () => {
    if (!activeConversation || !draftMessage.trim()) return;

    addMessage({
      threadId: activeConversation.threadId,
      senderId: workerChatId,
      receiverId: activeConversation.clientId,
      text: draftMessage,
    });
    setDraftMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen w-full animate-in slide-in-from-bottom-4 fade-in duration-300 ease-out flex-col overflow-hidden bg-slate-50">
      <header className="relative flex h-16 flex-shrink-0 items-center border-b border-slate-200 bg-white px-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6B35] shadow-lg shadow-[#FF6B35]/25">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-extrabold text-slate-950" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              WorkBridge
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Secure Chat</p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="flex w-1/4 max-w-sm min-w-[300px] flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Messages</h2>
                <p className="text-xs font-medium text-slate-500">Admin-ready encrypted threads</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search conversations"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => {
              const selected = conversation.threadId === activeConversation?.threadId;
              const lastMessage = getLastMessage(messagesByThread[conversation.threadId]);

              return (
                <button
                  key={conversation.threadId}
                  type="button"
                  onClick={() => handleSelectThread(conversation)}
                  className={`flex w-full cursor-pointer items-center gap-3 border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${
                    selected ? "bg-orange-50/70" : "bg-white"
                  }`}
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                    {conversation.clientAvatar}
                    <span className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.75)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-bold text-slate-900">{conversation.clientName}</p>
                      <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                        {formatMessageTime(lastMessage?.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{conversation.company}</p>
                    <p className="mt-1 truncate text-xs leading-5 text-slate-500">{lastMessage?.text ?? "No messages yet"}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-1 flex-col bg-slate-50/50">
          {activeConversation ? (
            <>
              <header className="z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                    {activeConversation.clientAvatar}
                    <span className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.75)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{activeConversation.clientName}</h3>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      <span className="text-xs font-bold text-emerald-600">Online</span>
                      <span className="text-xs font-medium text-slate-400">- {activeConversation.company}</span>
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  {activeConversation.threadId}
                </span>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {activeMessages.map((message) => {
                  const isUserMessage = message.senderId === workerChatId;

                  return (
                    <div
                      key={message.id}
                      className={`flex animate-in slide-in-from-bottom-2 fade-in duration-300 ease-out ${
                        isUserMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-3 text-sm leading-6 shadow-sm ${
                          isUserMessage
                            ? "rounded-2xl rounded-tr-sm bg-[#FF6B35] text-white shadow-[#FF6B35]/15"
                            : "rounded-2xl rounded-tl-sm border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`mt-1 text-[10px] font-bold ${isUserMessage ? "text-orange-100" : "text-slate-400"}`}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <footer className="border-t border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <input
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a secure message..."
                    className="min-w-0 flex-1 rounded-full bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-100"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25 transition hover:-translate-y-0.5 hover:bg-[#f05b24]"
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
              Select a conversation to start messaging.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function getLastMessage(messages = []) {
  return [...messages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
}

function formatMessageTime(timestamp) {
  if (!timestamp) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));
}

function WorkspaceEmptyState() {
  return (
    <div className="flex h-full items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Briefcase className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">Select a project</h3>
        <p className="mt-2 max-w-xs text-sm text-slate-500">Choose a task from your pipeline to view its delivery workspace and secure chat.</p>
      </div>
    </div>
  );
}
