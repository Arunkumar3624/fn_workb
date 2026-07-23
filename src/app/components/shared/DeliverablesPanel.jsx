import { useEffect, useState } from "react";
import {
  AlertCircle, Clock3, CheckCircle2, XCircle, Link2, Image as ImageIcon,
  ExternalLink, Upload, Send,
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
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-600 border-rose-200",
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
export default function DeliverablesPanel({ projectId }) {
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">Deliverables</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Share a link (Google Drive, Dropbox, etc.) or a small image — every submission is reviewed by WorkBridge before the other side can see it.
        </p>
      </div>

      {/* ── Submit form ── */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex gap-1 rounded-lg bg-white p-1 w-fit border border-slate-200">
          {[
            { id: "link", label: "Link", icon: Link2 },
            { id: "image", label: "Image", icon: ImageIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setMode(id); setSubmitError(""); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                mode === id ? "bg-[#1B3FAB] text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {submitError && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {mode === "link" ? (
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://drive.google.com/… or any file link"
            className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-2 focus:ring-blue-100"
          />
        ) : (
          <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50">
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
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-bold text-white hover:bg-[#E55E1F] disabled:opacity-60 flex-shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Sending…" : "Submit"}
          </button>
        </div>
      </div>

      {/* ── List ── */}
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
          </div>
        ) : loadError ? (
          <p className="py-4 text-center text-xs text-red-500">{loadError}</p>
        ) : submissions.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">No deliverables shared yet.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => {
              const meta = STATUS_META[s.status];
              const StatusIcon = meta.icon;
              return (
                <div key={s.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {s.type === "link" ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-sm font-semibold text-[#1B3FAB] hover:underline"
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
                      {s.caption && <p className="mt-1 text-xs text-slate-600">{s.caption}</p>}
                      <p className="mt-1 text-[11px] text-slate-400">
                        {s.submitted_by_name} · {new Date(s.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      {s.status === "REJECTED" && s.rejection_reason && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-500">Reason: {s.rejection_reason}</p>
                      )}
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${TONE_CLASSES[meta.tone]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {meta.label}
                    </span>
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
