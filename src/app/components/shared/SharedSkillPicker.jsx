import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

// The single canonical skill vocabulary both sides of a job post type
// into — WorkerProfile.jsx's own skills and BusinessPostJob.jsx's Required
// Skills used to be two free-text, comma-separated inputs with no shared
// source of truth, so "React" vs "React.js" vs "ReactJS" never matched
// each other. This is what the AI Shortlist perk's real skill-overlap
// ranking (projects.controller.js's getProjectShortlist) actually depends
// on lining up — a picker constrained to one real list, not open text.
export const STANDARD_SKILLS = [
  "React",
  "Node.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Java",
  "PostgreSQL",
  "MongoDB",
  "UI/UX Design",
  "Figma",
  "Graphic Design",
  "Content Writing",
  "Copywriting",
  "SEO",
  "Digital Marketing",
  "Data Analysis",
  "Video Editing",
  "WordPress",
  "DevOps",
  "AWS",
];

// Case-insensitive, so a stray "react" a worker already saved still renders
// as a real chip instead of silently vanishing — comparisons everywhere
// else (matching, dedup) normalize the same way.
function normalize(value) {
  return value.trim().toLowerCase();
}

export default function SharedSkillPicker({ selectedSkills, onChange, placeholder = "Type to search skills…" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const selectedSet = useMemo(() => new Set(selectedSkills.map(normalize)), [selectedSkills]);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    return STANDARD_SKILLS.filter((skill) => !selectedSet.has(normalize(skill)) && (q ? normalize(skill).includes(q) : true)).slice(0, 8);
  }, [query, selectedSet]);

  const addSkill = (skill) => {
    if (!skill || selectedSet.has(normalize(skill))) return;
    onChange([...selectedSkills, skill]);
    setQuery("");
    inputRef.current?.focus();
  };

  const removeSkill = (skill) => {
    onChange(selectedSkills.filter((s) => normalize(s) !== normalize(skill)));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // An exact match takes priority; otherwise the top suggestion,
      // falling back to whatever was typed so a genuinely new skill isn't
      // impossible to add, just not autocompleted.
      const exact = STANDARD_SKILLS.find((s) => normalize(s) === normalize(query));
      addSkill(exact ?? suggestions[0] ?? query.trim());
      return;
    }
    if (event.key === "Backspace" && !query && selectedSkills.length > 0) {
      removeSkill(selectedSkills[selectedSkills.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex min-h-12 w-full flex-wrap items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm shadow-sm transition-colors focus-within:border-[#1B3FAB] focus-within:ring-2 focus-within:ring-[#1B3FAB]/20 dark:border-slate-700 dark:bg-slate-800"
      >
        {selectedSkills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1 rounded-full bg-[#F4F6FF] px-2.5 py-1 text-xs font-semibold text-[#1B3FAB] dark:bg-[#1B3FAB]/15 dark:text-blue-300"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              aria-label={`Remove ${skill}`}
              className="rounded-full p-0.5 text-[#1B3FAB]/60 transition-colors hover:bg-[#1B3FAB]/10 hover:text-[#1B3FAB] dark:text-blue-300/60 dark:hover:bg-blue-400/10 dark:hover:text-blue-200"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder={selectedSkills.length === 0 ? placeholder : ""}
          className="min-w-[8rem] flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {suggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              // onMouseDown (not onClick) fires before the input's onBlur
              // closes this dropdown, so the click actually registers.
              onMouseDown={(event) => {
                event.preventDefault();
                addSkill(skill);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-[#F4F6FF] hover:text-[#1B3FAB] dark:text-slate-200 dark:hover:bg-[#1B3FAB]/15 dark:hover:text-blue-300"
            >
              {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
