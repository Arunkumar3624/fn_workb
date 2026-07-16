import { AlertTriangle, ShieldCheck, Sparkles, Trophy, X } from "lucide-react";

/**
 * Split-choice apply drawer — the psychological nudge that gets workers to
 * take the skill quiz instead of spamming direct applications. Pure
 * presentation: the parent owns what happens after a choice is made.
 */
export default function JobApplicationDrawer({
  open,
  job,
  potentialPoints,
  onClose,
  onChooseQuiz,
  onChooseDirect,
}) {
  if (!job) return null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full transform border-l border-white/40 bg-white/70 backdrop-blur-2xl shadow-2xl transition-transform duration-300 sm:w-[400px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col">
          <header className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-slate-100 p-6">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Apply to Job</p>
              <h2 className="mt-1 truncate text-lg font-black text-slate-900">{job.title}</h2>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-500">{job.company}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close application drawer"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-100 px-4 py-3">
              <Trophy size={16} className="flex-shrink-0 text-purple-700" />
              <p className="text-sm font-bold text-purple-700">Up to {potentialPoints} Pts for this job</p>
            </div>

            <p className="mb-4 text-sm font-semibold text-slate-600">Choose how you want to apply:</p>

            <div className="space-y-4">
              {/* Choice A — The Gamified Path */}
              <button
                type="button"
                onClick={onChooseQuiz}
                className="w-full rounded-2xl border-2 border-green-500 bg-white/50 backdrop-blur-md p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-lg"
              >
                <div className="flex items-center gap-1.5 text-green-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-xs font-black uppercase tracking-[0.14em]">Recommended</span>
                </div>
                <h3 className="mt-2 text-lg font-black text-slate-900">Take the Skill Quiz</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Prove your expertise and earn <strong className="text-green-700">+15 Behavior Points.</strong>
                </p>
                <span className="mt-4 flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-green-700">
                  Start Quiz (+15 PTS)
                </span>
              </button>

              {/* Choice B — The Lazy Path */}
              <button
                type="button"
                onClick={onChooseDirect}
                className="w-full rounded-2xl border border-red-200/60 bg-white/30 backdrop-blur-md p-5 text-left opacity-90 transition-all duration-300 hover:opacity-100"
              >
                <div className="flex items-center gap-1.5 text-red-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-xs font-black uppercase tracking-[0.14em]">Not recommended</span>
                </div>
                <h3 className="mt-2 text-lg font-black text-slate-600">Direct Apply</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Skip the quiz and apply instantly. Penalty: <strong className="text-red-600">-5 Points.</strong>
                </p>
                <span className="mt-4 flex w-full items-center justify-center rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition-colors hover:bg-red-100">
                  Apply Directly (-5 PTS)
                </span>
              </button>
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-xl bg-white/30 backdrop-blur-md p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <p className="text-xs leading-5 text-slate-500">
                Behavior points feed your Trust Score, which controls Elite visibility and access to
                higher-tier jobs.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
