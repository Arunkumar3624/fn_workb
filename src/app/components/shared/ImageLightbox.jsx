import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Shared full-screen preview for the small submission thumbnails
// (Admin Content Review, DeliverablesPanel) — those were plain <img> tags
// with no click handler at all, so there was no way to actually see a
// submitted image at a readable size. Portaled to document.body so it's
// never at risk of the containing-block trap other overlays in this app
// hit when nested inside a transformed ancestor.
export default function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    if (!src) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [src, onClose]);

  if (!src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt={alt ?? "Preview"}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
      />
    </div>,
    document.body
  );
}
