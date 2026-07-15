import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Lock, MessageSquare, Send, ShieldCheck } from "lucide-react";
import Avatar from "../shared/Avatar";
import IdentityHeader from "../shared/IdentityHeader";
import TimelineTracker from "../shared/TimelineTracker";
import ProjectCompletionHub from "../shared/ProjectCompletionHub";
import CelebrationOverlay from "../common/CelebrationOverlay";
import { usePlatformData } from "../../context/PlatformContext";
import { PROJECT_STATUS_META, nextProjectStatus } from "../../utils/projectStatus";

// ─── Thread list item ─────────────────────────────────────────────────────────

function ThreadItem({ thread, isSelected, onClick }) {
  const lastMsg = thread.messages.at(-1);
  const lastTime = lastMsg?.time?.split(",").at(-1)?.trim() ?? "";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-slate-100 cursor-pointer transition-colors ${
        isSelected ? "bg-white border-l-4 border-l-[#FF6B35] shadow-sm" : "hover:bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar
          initials={thread.workerInitials}
          bg={thread.workerBg}
          size="w-10 h-10"
          text="text-xs"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-[#0F172A] text-sm truncate">{thread.workerName}</span>
              {thread.unread > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
              )}
            </span>
            {thread.type === "qa" ? (
              <span className="font-semibold text-slate-900 text-sm flex-shrink-0">{thread.bid}</span>
            ) : (
              <span className="text-[10px] text-slate-400 flex-shrink-0">{lastTime}</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate">{thread.projectName}</p>
          <p
            className={`text-xs truncate mt-0.5 ${
              thread.unread > 0 ? "font-semibold text-slate-700" : "text-slate-500"
            }`}
          >
            {lastMsg?.from === "business" ? "You: " : ""}
            {lastMsg?.text}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Chat bubble ─────────────────────────────────────────────────────────────

function ChatBubble({ message, thread, prevFrom }) {
  const isWorker = message.from === "worker";
  const showName = isWorker && prevFrom !== "worker";

  return (
    <div className={`flex ${isWorker ? "justify-start" : "justify-end"}`}>
      <div
        className={`flex items-end gap-2 ${
          isWorker ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {isWorker && (
          <Avatar
            initials={thread.workerInitials}
            bg={thread.workerBg}
            size="w-7 h-7"
            text="text-[10px]"
          />
        )}
        <div>
          {showName && (
            <p className="text-[11px] font-bold text-slate-500 mb-1 ml-1">
              {thread.workerName}
            </p>
          )}
          <div
            className={
              isWorker
                ? "relative max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm"
                : "max-w-[76%] rounded-2xl rounded-br-sm bg-[#1B3FAB] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm shadow-[#1B3FAB]/20"
            }
          >
            {message.text}
          </div>
          <p
            className={`text-[10px] text-slate-400 mt-1 ${
              isWorker ? "ml-1" : "text-right mr-1"
            }`}
          >
            {message.time}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BusinessInboxRehire({ initialThread, chatKey }) {
  const navigate = useNavigate();
  const {
    businessThreadsDb: threads,
    setBusinessThreadsDb: setThreads,
    advanceBusinessThreadStatus,
    completeProject,
    submitRating,
    rehireWorker,
  } = usePlatformData();
  const [selectedId, setSelectedId] = useState(threads[0].id);
  const [input, setInput] = useState("");
  const [celebration, setCelebration] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // When "Chat" is clicked in Active Projects, auto-select that worker's thread
  useEffect(() => {
    if (!initialThread) return;
    const match = threads.find((t) => t.workerName === initialThread);
    if (!match) return;
    setSelectedId(match.id);
    setThreads((prev) =>
      prev.map((t) => (t.id === match.id ? { ...t, unread: 0 } : t))
    );
  // chatKey increments on each "Chat" button click so this fires
  // even if the same worker is clicked twice in a row
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatKey]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, threads]);

  const selectedThread = threads.find((t) => t.id === selectedId);

  const selectThread = (id) => {
    setSelectedId(id);
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t))
    );
    inputRef.current?.focus();
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !selectedId) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selectedId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: Date.now(), from: "business", text, time: "Just now" },
              ],
            }
          : t
      )
    );
    setInput("");
  };

  const activeThreads = threads.filter((t) => t.type === "active" && t.projectStatus !== "COMPLETED");
  const historyThreads = threads.filter((t) => t.projectStatus === "COMPLETED");
  const qaThreads = threads.filter((t) => t.type === "qa");
  const totalUnreadQA = qaThreads.reduce((n, t) => n + t.unread, 0);

  return (
    <div className="bg-slate-50 p-4 lg:p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex h-[750px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm wb-tab-enter">
        {/* ══════════════════════════════════════════════════════════════════════
            LEFT: Thread list
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="w-[34%] min-w-[260px] max-w-[360px] flex flex-col border-r border-slate-200 bg-slate-50/50 flex-shrink-0">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <h1
              className="font-bold text-[#0F172A] text-lg"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Conversations
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeThreads.length} active projects
              {totalUnreadQA > 0 && ` · ${totalUnreadQA} unread messages`}
            </p>
          </div>

          {/* Scrollable thread list */}
          <div className="flex-1 overflow-y-auto">
            {/* Active projects section */}
            <div className="px-4 pt-4 pb-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Active Projects
              </p>
            </div>
            {activeThreads.map((t) => (
              <ThreadItem
                key={t.id}
                thread={t}
                isSelected={selectedId === t.id}
                onClick={() => selectThread(t.id)}
              />
            ))}

            {/* Pre-hire messages section */}
            <div className="px-4 pt-5 pb-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Pre-Hire Messages
              </p>
            </div>
            {qaThreads.map((t) => (
              <ThreadItem
                key={t.id}
                thread={t}
                isSelected={selectedId === t.id}
                onClick={() => selectThread(t.id)}
              />
            ))}

            {/* History — completed & paid projects */}
            {historyThreads.length > 0 && (
              <>
                <div className="px-4 pt-5 pb-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    History
                  </p>
                </div>
                {historyThreads.map((t) => (
                  <ThreadItem
                    key={t.id}
                    thread={t}
                    isSelected={selectedId === t.id}
                    onClick={() => selectThread(t.id)}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            RIGHT: Chat panel
        ══════════════════════════════════════════════════════════════════════ */}
        {selectedThread ? (
        selectedThread.projectStatus === "COMPLETED" ? (
          /* Project Completion & Retention Hub — replaces the active chat
             surface entirely once a project is done and paid out. */
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            <IdentityHeader
              name={selectedThread.workerName}
              subtitle={`${selectedThread.workerRole} · ${selectedThread.projectName}`}
              initials={selectedThread.workerInitials}
              avatarBg={selectedThread.workerBg}
              statusPill={{ text: "Completed", tone: "emerald" }}
            />
            <ProjectCompletionHub
              perspective="business"
              counterpartName={selectedThread.workerName}
              amount={selectedThread.budget}
              review={selectedThread.review}
              onSubmit={(rating, feedback) => submitRating(selectedThread.id, rating, feedback)}
              onRehire={() => {
                const newId = rehireWorker(selectedThread.id);
                if (newId) setSelectedId(newId);
              }}
              onViewHistory={() => {
                const firstHistoryThread = threads.find((t) => t.projectStatus === "COMPLETED");
                if (firstHistoryThread) setSelectedId(firstHistoryThread.id);
              }}
            />
          </div>
        ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
          {/* Identity Anchor — pinned at the top for both Pending (Q&A) and Accepted (Active) threads */}
          <IdentityHeader
            name={selectedThread.workerName}
            subtitle={`${selectedThread.workerRole} · ${selectedThread.projectName}`}
            initials={selectedThread.workerInitials}
            avatarBg={selectedThread.workerBg}
            verified={selectedThread.projectStatus !== "FILES_SUBMITTED"}
            rating={selectedThread.type === "qa" ? selectedThread.rating : undefined}
            reviews={selectedThread.type === "qa" ? selectedThread.reviews : undefined}
            statusPill={
              selectedThread.projectStatus === "FILES_SUBMITTED"
                ? { text: "Action Required: Review Files", tone: "amber" }
                : undefined
            }
          />

          {/* Slim Timeline Header — only once funds are actually secured */}
          {selectedThread.projectStatus && <TimelineTracker status={selectedThread.projectStatus} />}

          {/* The Vault — proposed bid for pre-hire threads, secured indicator for active ones */}
          {selectedThread.type === "qa" ? (
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-end">
              <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl">
                <span className="text-xs text-slate-400">Proposed Bid:</span>
                <span className="text-xl font-black text-emerald-400">{selectedThread.bid}</span>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 bg-emerald-50 border-b border-emerald-100 px-6 py-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <p className="text-[11px] font-semibold text-emerald-700">Funds secured for this project</p>
            </div>
          )}

          {/* Primary Action — only rendered when it's the business's turn to act */}
          {selectedThread.projectStatus &&
            PROJECT_STATUS_META[selectedThread.projectStatus]?.actionBy === "business" && (
              <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-2.5 flex justify-end">
                <button
                  onClick={() => {
                    const next = nextProjectStatus(selectedThread.projectStatus);
                    if (next === "COMPLETED") {
                      const earnings = completeProject(selectedThread.id);
                      setCelebration({ name: selectedThread.workerName, amount: earnings });
                    } else {
                      advanceBusinessThreadStatus(selectedThread.id, next);
                    }
                  }}
                  className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  {PROJECT_STATUS_META[selectedThread.projectStatus].nextActionLabel}
                </button>
              </div>
            )}

          {/* Privacy notice */}
          <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 px-5 py-2 flex items-center gap-2">
            <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
            <p className="text-[11px] text-amber-700">
              Sharing personal contact info is prohibited and will trigger an automatic account
              review.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-4">
            {selectedThread.messages.map((msg, idx) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                thread={selectedThread}
                prevFrom={idx > 0 ? selectedThread.messages[idx - 1].from : null}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer — Communication + the Conversion CTA */}
          <div className="flex-shrink-0 bg-white border-t border-slate-200 p-6 flex flex-col gap-4">
            {/* Row 1: Communication */}
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  selectedThread.type === "qa"
                    ? "Answer their question…"
                    : "Message securely via WorkBridge…"
                }
                className="flex-1 px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Row 2: The Revenue Driver — only a live proposal has funds to secure */}
            {selectedThread.type === "qa" && (
              <button
                onClick={() => navigate(`/invoice?role=business&id=${selectedThread.id}`)}
                className="w-full bg-[#FF6B35] hover:bg-[#e55a2b] text-white py-4 rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(255,107,53,0.39)] transition-transform active:scale-[0.98] flex justify-center items-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Accept Proposal &amp; Secure Funds
              </button>
            )}

            <p className="text-[10px] text-slate-400 text-center">
              256-bit secured · External contact info is monitored and blocked
            </p>
          </div>
        </div>
        )
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">Select a conversation</p>
              <p className="text-slate-400 text-sm mt-1">
                Choose a thread from the left to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {celebration && (
        <CelebrationOverlay
          variant="paid"
          title="Payment Released!"
          message={`${celebration.name} has been paid and notified. Great work closing this one out.`}
          amount={celebration.amount}
          primaryLabel="Continue"
          onPrimary={() => setCelebration(null)}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
}
