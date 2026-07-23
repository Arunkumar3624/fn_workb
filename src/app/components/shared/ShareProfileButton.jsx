import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";

// navigator.share is only available on secure-context/mobile-leaning
// browsers — desktop Chrome/Firefox have no native share sheet, so the
// clipboard fallback below is the common path there, not an edge case.
async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Profile link copied!");
    return true;
  } catch {
    toast.error("Could not copy the link — copy it from your browser's address bar instead.");
    return false;
  }
}

export default function ShareProfileButton({ url, title, text, className = "" }) {
  const [justCopied, setJustCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // AbortError just means the user closed the native share sheet —
        // not a failure worth falling back from.
        if (err?.name === "AbortError") return;
      }
    }
    const copied = await copyLink(url);
    if (copied) {
      setJustCopied(true);
      window.setTimeout(() => setJustCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ||
        "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
      }
    >
      {justCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
      Share Profile
    </button>
  );
}
