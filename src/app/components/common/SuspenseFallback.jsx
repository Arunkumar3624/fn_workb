import { Loader2 } from "lucide-react";

// One shared loading state for every code-split boundary (route-level in
// App.jsx, tab-level in AdminPanel.jsx) — same visual language everywhere
// instead of each Suspense boundary inventing its own spinner.
export default function SuspenseFallback({ label = "Loading…", fullScreen = true }) {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-[#F8FAFC]"
          : "flex h-full min-h-[240px] items-center justify-center"
      }
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-[#FF6B35]" />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      </div>
    </div>
  );
}
