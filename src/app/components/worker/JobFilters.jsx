import { Check, Flame, RotateCcw } from "lucide-react";

// A single skill checkbox — skills come from allSkills below, never a fixed
// guessed list, so this can only ever show a category that's actually on a
// real open job right now.
function SkillCheckbox({ skill, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(skill)}
      className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-slate-50"
    >
      <span
        className={`flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? "border-[#FF6B35] bg-[#FF6B35]" : "border-slate-300 bg-white"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className={`truncate text-sm ${checked ? "font-semibold text-slate-900" : "text-slate-500"}`}>{skill}</span>
    </button>
  );
}

// The Job Feed's filter sidebar — every option here is real, live data
// (real budgets, the real is_urgent flag, and skills pulled straight from
// what businesses actually typed when posting — see WorkerJobFeed.jsx's
// allSkills). Sticky so it stays in view while the card grid scrolls.
export default function JobFilters({
  allSkills,
  selectedSkills,
  onToggleSkill,
  budgetRange,
  onBudgetChange,
  urgentOnly,
  onToggleUrgent,
  onClear,
  hasActiveFilters,
}) {
  return (
    <aside className="wb-scroll-clean sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-900">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-bold text-[#FF6B35] transition-colors hover:text-[#e55e1f]"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onToggleUrgent}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition-colors ${
            urgentOnly
              ? "border-[#FF6B35] bg-[#FF6B35] text-white"
              : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Flame className="h-4 w-4" />
          Urgent only
        </button>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-900">Budget</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Min"
              value={budgetRange.min}
              onChange={(event) => onBudgetChange({ ...budgetRange, min: event.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-6 pr-2 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <span className="flex-shrink-0 text-slate-300">–</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Max"
              value={budgetRange.max}
              onChange={(event) => onBudgetChange({ ...budgetRange, max: event.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-6 pr-2 text-sm text-slate-900 outline-none focus:border-[#1B3FAB] focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {allSkills.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-900">Skills</p>
          <div className="wb-scroll-clean mt-2 max-h-72 overflow-y-auto">
            {allSkills.map((skill) => (
              <SkillCheckbox
                key={skill}
                skill={skill}
                checked={selectedSkills.includes(skill)}
                onToggle={onToggleSkill}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
