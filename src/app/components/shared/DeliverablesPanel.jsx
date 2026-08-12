import { useEffect, useState } from "react";
import {
  AlertCircle, Clock3, CheckCircle2, XCircle, Link2, Image as ImageIcon,
  ExternalLink, Loader2, Upload, Send, Download,
} from "lucide-react";
import { listSubmissions, submitLink, submitImage } from "../../lib/submissionsApi";
import { ApiError } from "../../lib/apiClient";
import { getSocket } from "../../lib/socketClient";
import ImageLightbox from "./ImageLightbox";
import brandLogo from "../../assets/logo.png";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // matches the backend's ~8MB cap

const STATUS_META = {
  PENDING_REVIEW: { label: "Pending Review", tone: "amber", icon: Clock3 },
  APPROVED: { label: "Approved", tone: "emerald", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", tone: "rose", icon: XCircle },
};

const TONE_CLASSES = {
  amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
  rose: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40",
};

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

// A link back to WorkBridge itself (e.g. an invoice or profile URL shared as
// reference material) gets our own mark instead of a generic link glyph —
// every other host keeps the plain Link2 icon.
function isInternalLink(url) {
  return url.toLowerCase().includes("workbridge");
}

// Used on both sides of a project — worker sharing finished work, business
// sharing reference material. Every submission goes through admin
// moderation first; the API itself hides PENDING_REVIEW/REJECTED items from
// whichever participant didn't submit them, so this component never has to
// implement that rule client-side.
//
// `locked` is worker-only (WorkerWorkspace.jsx passes it, keyed off the real
// project status) — a worker could previously submit "finished work" before
// ever clicking Start Work, which made no sense against the real
// ACCEPTED/FUNDS_SECURED -> WORK_IN_PROGRESS flow. Business callers never
// pass this: reference material is legitimate to share at any stage.
// `downloadable` swaps each submission's action from "click to preview inline"
// (nice for a worker reviewing their own already-submitted work) to a plain,
// literal action a business reviewing someone else's work actually wants:
// "Open Link" for a link, "Download Image" for an image — a real file save,
// not just a lightbox. Only the business's read-only "View Worker" popup
// passes this; WorkerWorkspace.jsx's own view keeps the preview behavior.
export default function DeliverablesPanel({ projectId, readOnly = false, locked = false, lockedMessage, downloadable = false }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState("link");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [previewSrc, setPreviewSrc] = useState(null);

  const load = () => {
    setLoading(true);
    setLoadError("");
    listSubmissions(projectId)
      .then(setSubmissions)
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Could not load deliverables."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Refetch when a submission on THIS project is created or reviewed by the
  // other participant/admin, so the drawer/panel updates live instead of
  // needing a close-and-reopen. See backend/src/realtime/events.js.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleProjectEvent = (event) => {
      if (event.projectId !== projectId) return;
      if (event.type === "SUBMISSION_CREATED" || event.type === "SUBMISSION_REVIEWED") load();
    };

    socket.on("project:event", handleProjectEvent);
    return () => socket.off("project:event", handleProjectEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleImagePick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setSubmitError("");
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setSubmitError("Image is too large (max 8MB) — use a link (Google Drive, Dropbox, etc.) for bigger files or videos.");
      return;
    }
    setImageFile(file);
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      if (mode === "link") {
        if (!url.trim()) {
          setSubmitError("Paste a link first.");
          setSubmitting(false);
          return;
        }
        await submitLink({ projectId, url: url.trim(), caption: caption.trim() || undefined });
        setUrl("");
      } else {
        if (!imageFile) {
          setSubmitError("Choose an image first.");
          setSubmitting(false);
          return;
        }
        const imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        await submitImage({ projectId, imageData, caption: caption.trim() || undefined });
        setImageFile(null);
      }
      setCaption("");
      load();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not submit this deliverable.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deliverables</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {readOnly
            ? "This project is closed — shown here for the record only."
            : locked
              ? "You'll be able to share your work here once you start it."
              : "Share a link (Google Drive, Dropbox, etc.) or a small image — every submission is reviewed by WorkBridge before the other side can see it."}
        </p>
      </div>

      {/* ── Reminder — the project hasn't been started yet (worker-only
          gate, see the prop comment above). Points back at the real Start
          Work action instead of duplicating it here. */}
      {locked && !readOnly && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
            {lockedMessage ?? 'Click "Start Work" above to begin — you can share deliverables once work is underway.'}
          </p>
        </div>
      )}

      {/* ── Submit form — hidden once the project is closed or not started
          yet. There's no legitimate reason to keep sharing files on a
          cancelled project; the list below still shows whatever was already
          shared before it closed. */}
      {!readOnly && !locked && (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-3 flex gap-1 rounded-lg bg-white p-1 w-fit border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          {[
            { id: "link", label: "Link", icon: Link2 },
            { id: "image", label: "Image", icon: ImageIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setMode(id); setSubmitError(""); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                mode === id ? "bg-[#1B3FAB] text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {submitError && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {mode === "link" ? (
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://drive.google.com/… or any file link"
            className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500/20"
          />
        ) : (
          <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
            <Upload className="h-4 w-4 flex-shrink-0" />
            {imageFile ? imageFile.name : "Choose an image (max 8MB)"}
            <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
          </label>
        )}

        <div className="flex gap-2">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Optional note"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500/20"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-bold text-white hover:bg-[#E55E1F] disabled:opacity-60 flex-shrink-0"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {submitting ? "Sending…" : "Submit"}
          </button>
        </div>
      </div>
      )}

      {/* ── List ── */}
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB] dark:border-slate-700" />
          </div>
        ) : loadError ? (
          <p className="py-4 text-center text-xs text-red-500 dark:text-red-400">{loadError}</p>
        ) : submissions.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">No deliverables shared yet.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => {
              const meta = STATUS_META[s.status];
              const StatusIcon = meta.icon;
              return (
                <div key={s.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {downloadable ? (
                        s.type === "link" ? (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1B3FAB]/20 bg-[#F4F6FF] px-3 py-1.5 text-xs font-bold text-[#1B3FAB] transition hover:bg-[#1B3FAB]/10 dark:border-[#1B3FAB]/30 dark:bg-[#1B3FAB]/10 dark:text-blue-400 dark:hover:bg-[#1B3FAB]/15"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open Link
                          </a>
                        ) : s.type === "image" ? (
                          <div className="flex items-center gap-3">
                            <img src={s.image_data} alt={s.caption ?? "Submitted image"} className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
                            <a
                              href={s.image_data}
                              download={`deliverable-${s.id}.png`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download Image
                            </a>
                          </div>
                        ) : (
                          <a
                            href={s.url || s.image_data}
                            download
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download File
                          </a>
                        )
                      ) : s.type === "link" ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-sm font-semibold text-[#1B3FAB] dark:text-blue-400 hover:underline"
                        >
                          {isInternalLink(s.url) ? (
                            <img src={brandLogo} alt="WorkBridge" className="h-3.5 w-3.5 flex-shrink-0 object-contain" />
                          ) : (
                            <Link2 className="h-3.5 w-3.5 flex-shrink-0" />
                          )}
                          {detectProvider(s.url)}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPreviewSrc(s.image_data)}
                          aria-label="View full image"
                          className="h-20 w-20 overflow-hidden rounded-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/40"
                        >
                          <img src={s.image_data} alt={s.caption ?? "Submitted image"} className="h-full w-full object-cover" />
                        </button>
                      )}
                      {s.caption && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{s.caption}</p>}
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {s.submitted_by_name} · {new Date(s.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      {s.status === "REJECTED" && s.rejection_reason && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-500 dark:text-rose-400">Reason: {s.rejection_reason}</p>
                      )}
                    </div>
                    {/* An "Approved" badge is the one status either side
                        can see on the SAME item — it would tell both
                        participants their shared content passes through an
                        admin review before becoming visible, which they
                        haven't necessarily agreed to know about. Pending/
                        Rejected badges stay: those are only ever shown to
                        the person who submitted their own content, about
                        its own status — not something being revealed about
                        the other side. */}
                    {s.status !== "APPROVED" && (
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${TONE_CLASSES[meta.tone]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ImageLightbox src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </div>
  );
}
