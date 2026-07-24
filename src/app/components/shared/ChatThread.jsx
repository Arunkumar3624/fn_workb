import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Loader2,
  Paperclip,
  Send,
  Upload,
  X,
} from "lucide-react";
import { listMessages, sendImageMessage, sendLinkMessage, sendMessage } from "../../lib/messagesApi";
import { ApiError } from "../../lib/apiClient";
import { getSocket } from "../../lib/socketClient";
import { useAuth } from "../../context/AuthContext";
import ImageLightbox from "./ImageLightbox";
import brandLogo from "../../assets/logo.png";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// A soft client-side mirror of the backend's contactFilter.js — purely for
// instant feedback before the round trip; the server is still the one
// source of truth (see messages.controller.js's sendMessage), so a message
// that slips past this can never slip past the API.
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_PATTERN = /(?:\d[\s.\-()]?){7,}\d/;
function looksLikeContactInfo(text) {
  return EMAIL_PATTERN.test(text) || PHONE_PATTERN.test(text);
}

function isInternalLink(url) {
  return url.toLowerCase().includes("workbridge");
}

function detectProvider(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("drive.google")) return "Google Drive";
    if (host.includes("dropbox")) return "Dropbox";
    if (host.includes("onedrive") || host.includes("1drv")) return "OneDrive";
    if (host.includes("wetransfer")) return "WeTransfer";
    return host;
  } catch {
    return "Link";
  }
}

// An attachment bubble wraps a submission that's still going through the
// same Trust Checker moderation every other shared file does — a pending/
// rejected one is only ever rendered for the person who sent it (the
// listMessages visibility filter already hides it from the other side
// entirely), and per an earlier privacy decision there's no "Approved"
// badge either — that would tell both sides admin is watching their
// shared content, which they haven't necessarily agreed to know about.
function AttachmentBubble({ message, isMine, onPreview }) {
  const isPending = message.submission_status === "PENDING_REVIEW";
  const isRejected = message.submission_status === "REJECTED";

  return (
    <div className={`max-w-[78%] rounded-2xl border p-3 ${isMine ? "border-blue-100 bg-blue-50/60" : "border-slate-200 bg-white"}`}>
      {message.submission_type === "link" ? (
        <a
          href={message.submission_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#1B3FAB] hover:underline"
        >
          {isInternalLink(message.submission_url) ? (
            <img src={brandLogo} alt="WorkBridge" className="h-3.5 w-3.5 flex-shrink-0 object-contain" />
          ) : (
            <Link2 className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          {detectProvider(message.submission_url)}
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      ) : (
        <button
          type="button"
          onClick={() => onPreview(message.submission_image_data)}
          aria-label="View full image"
          className="h-20 w-20 overflow-hidden rounded-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/40"
        >
          <img src={message.submission_image_data} alt={message.submission_caption ?? "Shared image"} className="h-full w-full object-cover" />
        </button>
      )}
      {message.submission_caption && <p className="mt-1.5 text-xs text-slate-600">{message.submission_caption}</p>}
      {isPending && (
        <p className="mt-1.5 text-[11px] font-bold text-amber-600">Pending review — only you can see this until it's cleared.</p>
      )}
      {isRejected && (
        <p className="mt-1.5 text-[11px] font-bold text-rose-500">
          Rejected{message.submission_rejection_reason ? `: ${message.submission_rejection_reason}` : ""}
        </p>
      )}
    </div>
  );
}

// An admin warning (Security Monitor's "Warn" action) — a real, permanent
// message, but rendered as a centered system banner rather than a bubble
// attributed to either participant, since neither side "sent" it.
function SystemNoticeRow({ message }) {
  const time = new Date(message.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex justify-center">
      <div className="flex max-w-[85%] items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-red-600">Admin Notice</p>
          <p className="mt-1 text-sm text-red-800">{message.body}</p>
          <span className="mt-1.5 block text-[11px] font-semibold text-red-400">{time}</span>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ message, isMine, onPreview }) {
  const time = new Date(message.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  if (message.is_system_notice) return <SystemNoticeRow message={message} />;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[78%] flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
        {message.submission_id ? (
          <AttachmentBubble message={message} isMine={isMine} onPreview={onPreview} />
        ) : (
          <div
            className={`rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
              isMine ? "rounded-br-lg bg-[#1B3FAB] text-white" : "rounded-bl-lg border border-slate-200 bg-white text-slate-800"
            }`}
          >
            {message.body}
          </div>
        )}
        <span className="px-1 text-[11px] font-semibold text-slate-400">{time}</span>
      </div>
    </div>
  );
}

// The real, persisted chat — one continuous thread per project spanning
// invite through completion, replacing the fake seeded conversations that
// used to live as local-only state inside WorkerNegotiationInbox.jsx and
// BusinessNegotiationHub.jsx. Deliberately headerless — call sites keep
// their own existing header (job details / contract-terms button etc.) and
// just render this for the feed + composer.
export default function ChatThread({ projectId }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachMode, setAttachMode] = useState("link");
  const [attachUrl, setAttachUrl] = useState("");
  const [attachCaption, setAttachCaption] = useState("");
  const [attachImageFile, setAttachImageFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const feedRef = useRef(null);

  const load = () => {
    listMessages(projectId)
      .then(setMessages)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load messages."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    setLoadError("");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleProjectEvent = (event) => {
      if (event.projectId !== projectId) return;
      if (event.type === "MESSAGE_CREATED" || event.type === "SUBMISSION_REVIEWED") load();
    };

    socket.on("project:event", handleProjectEvent);
    return () => socket.off("project:event", handleProjectEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    if (looksLikeContactInfo(body)) {
      setSendError("Sharing phone numbers or email addresses in chat isn't allowed — keep contact details off WorkBridge.");
      return;
    }
    setSendError("");
    setSending(true);
    try {
      await sendMessage(projectId, body);
      setDraft("");
      load();
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : "Could not send that message.");
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setSendError("");
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setSendError("Image is too large (max 8MB) — use a link (Google Drive, Dropbox, etc.) for bigger files.");
      return;
    }
    setAttachImageFile(file);
  };

  const handleSendAttachment = async () => {
    setSendError("");
    if (looksLikeContactInfo(attachCaption)) {
      setSendError("Sharing phone numbers or email addresses in chat isn't allowed — keep contact details off WorkBridge.");
      return;
    }
    setSending(true);
    try {
      if (attachMode === "link") {
        if (!attachUrl.trim()) {
          setSendError("Paste a link first.");
          setSending(false);
          return;
        }
        await sendLinkMessage({ projectId, url: attachUrl.trim(), caption: attachCaption.trim() || undefined });
        setAttachUrl("");
      } else {
        if (!attachImageFile) {
          setSendError("Choose an image first.");
          setSending(false);
          return;
        }
        const imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(attachImageFile);
        });
        await sendImageMessage({ projectId, imageData, caption: attachCaption.trim() || undefined });
        setAttachImageFile(null);
      }
      setAttachCaption("");
      setAttachOpen(false);
      load();
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : "Could not share that.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={feedRef} className="wb-scroll-clean min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
          </div>
        ) : loadError ? (
          <p className="py-4 text-center text-xs text-red-500">{loadError}</p>
        ) : messages.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">No messages yet — say hello.</p>
        ) : (
          messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              isMine={message.sender_id === currentUser?.id}
              onPreview={setPreviewSrc}
            />
          ))
        )}
      </div>

      {attachOpen && (
        <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex gap-1 rounded-lg bg-white p-1 w-fit border border-slate-200">
              {[
                { id: "link", label: "Link", icon: Link2 },
                { id: "image", label: "Image", icon: ImageIcon },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAttachMode(id)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                    attachMode === id ? "bg-[#1B3FAB] text-white" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setAttachOpen(false)}
              aria-label="Close attachment panel"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {attachMode === "link" ? (
            <input
              value={attachUrl}
              onChange={(e) => setAttachUrl(e.target.value)}
              placeholder="https://drive.google.com/… or any file link"
              className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50">
              <Upload className="h-4 w-4 flex-shrink-0" />
              {attachImageFile ? attachImageFile.name : "Choose an image (max 8MB)"}
              <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
            </label>
          )}

          <div className="flex gap-2">
            <input
              value={attachCaption}
              onChange={(e) => setAttachCaption(e.target.value)}
              placeholder="Optional note"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={handleSendAttachment}
              disabled={sending}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-bold text-white hover:bg-[#E55E1F] disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Share
            </button>
          </div>
        </div>
      )}

      {sendError && (
        <div className="flex flex-shrink-0 items-start gap-2 border-t border-red-100 bg-red-50 px-5 py-2.5 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{sendError}</span>
        </div>
      )}

      <form onSubmit={handleSend} className="flex-shrink-0 border-t border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-[#1B3FAB] focus-within:ring-4 focus-within:ring-[#1B3FAB]/10">
          <button
            type="button"
            onClick={() => setAttachOpen((open) => !open)}
            aria-label="Attach a file"
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition ${
              attachOpen ? "bg-[#1B3FAB] text-white" : "text-slate-400 hover:bg-white hover:text-slate-600"
            }`}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            value={draft}
            onChange={(event) => { setDraft(event.target.value); setSendError(""); }}
            placeholder="Write a message..."
            className="min-h-[42px] flex-1 bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
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

      <ImageLightbox src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </div>
  );
}
