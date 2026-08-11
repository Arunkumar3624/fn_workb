import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Headphones, Loader2, Send } from "lucide-react";
import { getMyThread, sendMyMessage } from "../../lib/supportApi";
import { ApiError } from "../../lib/apiClient";
import { getSocket } from "../../lib/socketClient";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

// A worker/business's own real-time conversation with WorkBridge staff —
// separate from project chat (ChatThread.jsx), since it isn't scoped to
// any one project. No contact-info filter here on purpose: unlike chat
// with a counterparty (where sharing a phone number is a fee-bypass risk),
// sharing contact details with real support staff is legitimate.
export default function SupportChat() {
  useDocumentTitle("Support — WorkBridge");
  const { currentUser } = useAuth();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const feedRef = useRef(null);
  const isInitialScrollRef = useRef(true);

  const load = () => {
    getMyThread()
      .then((data) => {
        setThread(data.thread);
        setMessages(data.messages);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load your conversation."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleEvent = (event) => {
      if (event.type !== "SUPPORT_MESSAGE_CREATED") return;
      if (thread && event.threadId !== thread.id) return;
      load();
    };

    socket.on("project:event", handleEvent);
    return () => socket.off("project:event", handleEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread?.id]);

  useEffect(() => {
    if (!feedRef.current || messages.length === 0) return;
    feedRef.current.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: isInitialScrollRef.current ? "auto" : "smooth",
    });
    isInitialScrollRef.current = false;
  }, [messages.length]);

  const handleSend = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSendError("");
    setSending(true);
    try {
      await sendMyMessage(body);
      setDraft("");
      load();
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : "Could not send that message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-4 flex flex-shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#1B3FAB]/10 text-[#1B3FAB]">
            <Headphones className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-[#0A1128]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              WorkBridge Support
            </h1>
            <p className="text-sm text-slate-500">Real staff, real-time — send us anything you're stuck on.</p>
          </div>
        </div>
        {thread?.status === "RESOLVED" && (
          <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolved
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div ref={feedRef} className="wb-scroll-clean min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {loadError ? (
            <p className="py-4 text-center text-xs text-red-500">{loadError}</p>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Headphones className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-400">No messages yet — tell us what's going on, we're here to help.</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_id === currentUser?.id;
              const isStaff = message.sender_role === "admin";
              const time = new Date(message.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[78%] flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
                    {isStaff && !isMine && (
                      <span className="px-1 text-[11px] font-bold uppercase tracking-wide text-[#1B3FAB]">WorkBridge Support</span>
                    )}
                    <div
                      className={`rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        isMine
                          ? "rounded-br-lg bg-[#1B3FAB] text-white"
                          : isStaff
                            ? "rounded-bl-lg border border-[#1B3FAB]/15 bg-[#F4F6FF] text-slate-800"
                            : "rounded-bl-lg border border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {message.body}
                    </div>
                    <span className="px-1 text-[11px] font-semibold text-slate-400">{time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {sendError && (
          <div className="flex flex-shrink-0 items-start gap-2 border-t border-red-100 bg-red-50 px-5 py-2.5 text-xs text-red-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{sendError}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="flex-shrink-0 border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-[#1B3FAB] focus-within:ring-4 focus-within:ring-[#1B3FAB]/10">
            <input
              value={draft}
              onChange={(event) => { setDraft(event.target.value); setSendError(""); }}
              placeholder="Message WorkBridge Support..."
              className="min-h-[42px] flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-sm shadow-orange-200 transition hover:bg-[#e85d27] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!draft.trim() || sending}
              aria-label="Send message"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
