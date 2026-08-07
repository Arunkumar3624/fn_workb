import { Check, Flame, GraduationCap, IndianRupee, SlidersHorizontal, Tag, X } from "lucide-react";
import { EDUCATION_LABELS } from "../../utils/educationLevels";

// A single labelled checkbox — shared by the Skills and Education sections
// (skills come from real posted data, education levels from the same fixed
// enum the job cards themselves already render via EDUCATION_LABELS).
function OptionCheckbox({ label, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-50"
    >
      <span
        className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
          checked ? "border-[#FF6B35] bg-[#FF6B35]" : "border-slate-300 bg-white"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className={`truncate text-sm ${checked ? "font-semibold text-slate-900" : "text-slate-600"}`}>{label}</span>
    </button>
  );
}

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      <p className="text-xs font-bold uppercase tracking-wide text-slate-900">{label}</p>
    </div>
  );
}

const EDUCATION_LEVELS = Object.entries(EDUCATION_LABELS);

// The Job Feed's filter sidebar — every option here is real, live data
// (real budgets, the real is_urgent flag, skills pulled straight from what
// businesses actually typed when posting, and the same education_level /
// experience_years fields the job cards' own Qualifications chips already
// read from — see WorkerJobFeed.jsx's allSkills/EDUCATION_LABELS). Sticky,
// but sized to its own content rather than forced to fill the viewport — a
// short filter list used to render as a mostly-empty box nearly the full
// screen tall, which read as a layout bug rather than a design choice.
// max-h/overflow is a safety net for when content genuinely does exceed the
// viewport, not a floor on how tall this always is.
export default function JobFilters({
  allSkills,
  selectedSkills,
  onToggleSkill,
  budgetRange,
  onBudgetChange,
  urgentOnly,
  onToggleUrgent,
  selectedEducationLevels,
  onToggleEducationLevel,
  yourExperience,
  onExperienceChange,
  onClear,
  hasActiveFilters,
}) {
  const activeCount =
    selectedSkills.length +
    selectedEducationLevels.length +
    (urgentOnly ? 1 : 0) +
    (budgetRange.min !== "" ? 1 : 0) +
    (budgetRange.max !== "" ? 1 : 0) +
    (yourExperience !== "" ? 1 : 0);

  return (
    <aside className="wb-scroll-clean sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-black text-slate-900">Filters</h2>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B35] px-1.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 transition-colors hover:text-[#FF6B35]"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-6 p-5">
        <div>
          <SectionHeader icon={Flame} label="Urgency" />
          <button
            type="button"
            onClick={onToggleUrgent}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition-colors ${
              urgentOnly
                ? "border-[#FF6B35] bg-[#FF6B35] text-white shadow-sm shadow-orange-200"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Flame className="h-4 w-4" />
            Urgent only
          </button>
        </div>

        <div>
          <SectionHeader icon={IndianRupee} label="Budget" />
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
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-6 pr-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#1B3FAB] focus:bg-white focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-6 pr-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#1B3FAB] focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div>
          <SectionHeader icon={GraduationCap} label="Qualifications" />

          {/* Worker's own years of experience — checked against each job's
              real min/max_experience_years, not a job-side range, since a
              worker only ever has one number to give. */}
          <label className="mt-3 block text-[11px] font-semibold text-slate-500">Your experience (yrs)</label>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="e.g. 3"
            value={yourExperience}
            onChange={(event) => onExperienceChange(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[#1B3FAB] focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-3 space-y-0.5">
            {EDUCATION_LEVELS.map(([value, label]) => (
              <OptionCheckbox
                key={value}
                label={label}
                checked={selectedEducationLevels.includes(value)}
                onToggle={() => onToggleEducationLevel(value)}
              />
            ))}
          </div>
        </div>

        {allSkills.length > 0 && (
          <div>
            <SectionHeader icon={Tag} label={`Skills (${allSkills.length})`} />
            <div className="wb-scroll-clean mt-2 max-h-64 overflow-y-auto">
              {allSkills.map((skill) => (
                <OptionCheckbox
                  key={skill}
                  label={skill}
                  checked={selectedSkills.includes(skill)}
                  onToggle={() => onToggleSkill(skill)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
