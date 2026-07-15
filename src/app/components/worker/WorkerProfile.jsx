import { useEffect, useState } from "react";
import {
  Award,
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  GraduationCap,
  Languages,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Save,
  Send,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { usePlatformData } from "../../context/PlatformContext";
import LockedCurrencyInput from "../common/LockedCurrencyInput";
import {
  activitySchema,
  formatINR,
  portfolioSchema,
  profileDetailsSchema,
  skillsSchema,
} from "../../utils/formValidation";

const initialProfile = {
  name: "Priya Sharma",
  role: "Full-Stack Developer",
  location: "Mumbai, India",
  rating: "4.9",
  level: 7,
  points: 1286,
  behaviorScore: 850,
  completionRate: 94,
  interestTaken: 11,
  completedTasks: 8,
  bio: "I build reliable React, Node.js, and dashboard systems for fast-moving product teams. My work focuses on clean handoff, responsive UI, and production-ready implementation.",
  skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "AWS", "Docker", "Next.js"],
  languages: [
    { id: 1, name: "English", proficiency: "Fluent" },
    { id: 2, name: "Hindi", proficiency: "Native" },
    { id: 3, name: "Kannada", proficiency: "Basic" },
  ],
  education: [
    {
      id: 1,
      degree: "Advanced Product Engineering",
      institution: "WorkBridge Verified Credential",
      year: "2025",
    },
  ],
  activities: [
    {
      id: 1,
      client: "FinEdge India",
      initials: "FI",
      title: "Bug Fix Python Script",
      budget: 7500,
      description:
        "Completed a focused automation fix for a data cleanup script, including edge-case handling and delivery notes for the client engineering team.",
      tags: ["Python", "Bug Fix", "Automation"],
      status: "Completed a standard project",
      date: "2 days ago",
    },
    {
      id: 2,
      client: "Nova Studio",
      initials: "NS",
      title: "SaaS Pricing Page Refresh",
      budget: 48000,
      description:
        "Refined pricing-page hierarchy, comparison cards, and responsive implementation for a premium B2B SaaS launch.",
      tags: ["React", "Tailwind", "SaaS"],
      status: "Completed a standard project",
      date: "1 week ago",
    },
    {
      id: 3,
      client: "OpsPilot",
      initials: "OP",
      title: "Node API Cleanup",
      budget: 22000,
      description:
        "Standardized API errors, validation boundaries, and regression coverage across high-traffic Express endpoints.",
      tags: ["Node.js", "Express", "Testing"],
      status: "Completed a standard project",
      date: "2 weeks ago",
    },
  ],
  portfolio: [
    {
      id: 1,
      title: "FinTech Analytics Dashboard",
      budget: 65000,
      summary: "Built a responsive analytics dashboard with KPI cards, revenue charts, and operational reporting.",
      link: "https://example.com/fintech-dashboard",
      tags: ["React", "TypeScript", "Recharts"],
    },
    {
      id: 2,
      title: "Multi-Vendor E-Commerce Backend",
      budget: 82000,
      summary: "Delivered vendor, order, and payment APIs with clean database boundaries and handoff notes.",
      link: "https://example.com/ecommerce-backend",
      tags: ["Node.js", "PostgreSQL", "Payments"],
    },
  ],
};

const defaultAvatarUrl =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='80' fill='%231B3FAB'/%3E%3Ccircle cx='80' cy='62' r='28' fill='%23ffffff' opacity='0.95'/%3E%3Cpath d='M34 137c7-28 25-43 46-43s39 15 46 43' fill='%23ffffff' opacity='0.95'/%3E%3C/svg%3E";

function tagsToString(tags) {
  return tags.join(", ");
}

function stringToTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function firstValidationError(result) {
  return result.error?.issues?.[0]?.message || "Please check the form values.";
}

function ShareProfileModal({ open, onClose, profile }) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copyLink = async () => {
    await navigator.clipboard?.writeText("https://workbridge.com/p/priya-sharma");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Public profile
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Share {profile.name}'s profile</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close share modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="truncate text-sm font-medium text-slate-700">
            https://workbridge.com/p/priya-sharma
          </p>
        </div>

        <button
          type="button"
          onClick={copyLink}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition ${
            copied ? "bg-emerald-600" : "bg-[#1B3FAB] hover:bg-[#15338d]"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy profile link"}
        </button>
      </div>
    </div>
  );
}

function EditProfileModal({
  open,
  draft,
  skillInput,
  onClose,
  onSave,
  onChange,
  onSkillInputChange,
  onAddSkill,
  onRemoveSkill,
  onExperienceChange,
  onAddExperience,
  onRemoveExperience,
  onEducationChange,
  onAddEducation,
  onRemoveEducation,
  onLanguageChange,
  onAddLanguage,
  onRemoveLanguage,
  onPortfolioChange,
  onAddPortfolio,
  onRemovePortfolio,
}) {
  const [activeTab, setActiveTab] = useState("general");

  if (!open) return null;

  const handleSkillKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onAddSkill();
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "experience", label: "Experience & Ed" },
    { id: "skills", label: "Skills & Languages" },
    { id: "portfolio", label: "Portfolio" },
  ];

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm font-medium text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-100";
  const cardClass = "rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-lg";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 p-0 backdrop-blur-sm sm:p-6">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-[#CBD5E1] bg-white px-5 py-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF6B35]">Worker profile</p>
            <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Edit Profile</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(255,107,53,0.22)] transition hover:bg-[#e95c25]"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] transition hover:bg-slate-50"
              aria-label="Close edit profile"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-x-auto border-b border-[#CBD5E1] bg-slate-50 p-3 md:block md:space-y-2 md:overflow-visible md:border-b-0 md:border-r">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-bold transition md:w-full ${
                  activeTab === tab.id
                    ? "bg-[#FF6B35] text-white shadow-lg"
                    : "bg-white text-[#0F172A] ring-1 ring-[#CBD5E1] hover:bg-orange-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-6 sm:px-7">
            {activeTab === "general" && (
              <section className={cardClass}>
                <h3 className="text-lg font-bold text-[#0F172A]">General</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <TextInput label="Name" value={draft.name} onChange={(value) => onChange("name", value)} />
                  <TextInput label="Title" value={draft.role} onChange={(value) => onChange("role", value)} />
                  <TextInput label="Location" value={draft.location} onChange={(value) => onChange("location", value)} />
                  <div className="md:col-span-2">
                    <TextArea label="About Me" value={draft.bio} onChange={(value) => onChange("bio", value)} rows={6} />
                  </div>
                </div>
              </section>
            )}

            {activeTab === "experience" && (
              <div className="space-y-6">
                <section className={cardClass}>
                  <h3 className="text-lg font-bold text-[#0F172A]">Experience</h3>
                  <div className="mt-5 space-y-4">
                    {draft.activities.map((item, index) => (
                      <article key={item.id} className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">Experience {index + 1}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-600">Keep entries concise and outcome-focused.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveExperience(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                            aria-label="Remove experience"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <TextInput label="Client / Company" value={item.client} onChange={(value) => onExperienceChange(item.id, "client", value)} />
                          <TextInput label="Project Title" value={item.title} onChange={(value) => onExperienceChange(item.id, "title", value)} />
                          <TextInput label="Date" value={item.date} onChange={(value) => onExperienceChange(item.id, "date", value)} />
                          <TextInput label="Status" value={item.status} onChange={(value) => onExperienceChange(item.id, "status", value)} />
                          <div className="md:col-span-2">
                            <TextArea label="Description" value={item.description} onChange={(value) => onExperienceChange(item.id, "description", value)} rows={3} />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={onAddExperience}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#FF6B35] bg-white px-4 py-4 text-sm font-bold text-[#FF6B35] shadow-lg transition hover:bg-[#FF6B35] hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Experience
                  </button>
                </section>

                <section className={cardClass}>
                  <h3 className="text-lg font-bold text-[#0F172A]">Education</h3>
                  <div className="mt-5 space-y-4">
                    {draft.education.map((item, index) => (
                      <article key={item.id} className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-lg">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-[#0F172A]">Education {index + 1}</p>
                          <button
                            type="button"
                            onClick={() => onRemoveEducation(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                            aria-label="Remove education"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <TextInput label="Degree / Certificate Name" value={item.degree} onChange={(value) => onEducationChange(item.id, "degree", value)} />
                          <TextInput label="Institution / University" value={item.institution} onChange={(value) => onEducationChange(item.id, "institution", value)} />
                          <TextInput label="Graduation Year" value={item.year} onChange={(value) => onEducationChange(item.id, "year", value)} />
                        </div>
                      </article>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={onAddEducation}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#e95c25]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Education
                  </button>
                </section>
              </div>
            )}

            {activeTab === "skills" && (
              <div className="space-y-6">
                <section className={cardClass}>
                  <h3 className="text-lg font-bold text-[#0F172A]">Skills</h3>
                  <label className="mt-5 block">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F172A]">Add skill</span>
                    <input
                      value={skillInput}
                      onChange={(event) => onSkillInputChange(event.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="Type a skill and press Enter"
                      className={inputClass}
                    />
                  </label>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {draft.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 text-xs font-bold text-[#0F172A] ring-1 ring-[#CBD5E1]">
                        {skill}
                        <button type="button" onClick={() => onRemoveSkill(skill)} className="text-slate-500 transition hover:text-red-600" aria-label={`Remove ${skill}`}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </section>

                <section className={cardClass}>
                  <h3 className="text-lg font-bold text-[#0F172A]">Languages</h3>
                  <div className="mt-5 space-y-3">
                    {draft.languages.map((language) => (
                      <div key={language.id} className="grid gap-3 rounded-xl border border-[#CBD5E1] bg-white p-4 shadow-lg md:grid-cols-[1fr_180px_44px] md:items-end">
                        <TextInput label="Language" value={language.name} onChange={(value) => onLanguageChange(language.id, "name", value)} />
                        <label className="block">
                          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F172A]">Proficiency</span>
                          <select
                            value={language.proficiency}
                            onChange={(event) => onLanguageChange(language.id, "proficiency", event.target.value)}
                            className={inputClass}
                          >
                            <option>Basic</option>
                            <option>Fluent</option>
                            <option>Native</option>
                          </select>
                        </label>
                        <button
                          type="button"
                          onClick={() => onRemoveLanguage(language.id)}
                          className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                          aria-label="Remove language"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={onAddLanguage}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#FF6B35] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#e95c25]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Language
                  </button>
                </section>
              </div>
            )}

            {activeTab === "portfolio" && (
              <section className={cardClass}>
                <h3 className="text-lg font-bold text-[#0F172A]">Portfolio</h3>
                <div className="mt-5 space-y-4">
                  {draft.portfolio.map((item, index) => (
                    <article key={item.id} className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-lg">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-[#0F172A]">Portfolio Project {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => onRemovePortfolio(item.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                          aria-label="Remove portfolio project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <TextInput label="Project Title" value={item.title} onChange={(value) => onPortfolioChange(item.id, "title", value)} />
                        <TextInput label="Project URL / Link" value={item.link || ""} onChange={(value) => onPortfolioChange(item.id, "link", value)} />
                        <div className="md:col-span-2">
                          <TextArea label="Short Description" value={item.summary} onChange={(value) => onPortfolioChange(item.id, "summary", value)} rows={4} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onAddPortfolio}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#e95c25]"
                >
                  <Plus className="h-4 w-4" />
                  Add Portfolio Project
                </button>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function IconButton({ label, onClick, children, tone = "default" }) {
  const styles = {
    default: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
    primary: "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100",
    danger: "border-red-100 bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${styles[tone]}`}
    >
      {children}
    </button>
  );
}

function ActionButton({ children, onClick, icon: Icon, tone = "primary" }) {
  const styles = {
    primary: "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100",
    neutral: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger: "border-red-100 bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${styles[tone]}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function EditIconButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-200"
    >
      <Pencil className="w-4 h-4" />
    </button>
  );
}

function Badge({ children, tone = "blue" }) {
  const styles = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    gold: "border-amber-100 bg-amber-50 text-amber-700",
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${styles[tone]}`}>
      {children}
    </span>
  );
}

function TextInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F172A]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm font-medium text-[#0F172A] outline-none transition focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0F172A]">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-none rounded-xl border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm font-medium leading-6 text-[#0F172A] outline-none transition focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}

function CurrencyInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <LockedCurrencyInput
        value={value}
        onChange={onChange}
        inputClassName="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function CircularProgress({ value }) {
  const safeValue = Math.max(0, Math.min(Number(value) || 0, 100));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative mx-auto h-32 w-32">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-100"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[#1B3FAB] transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{safeValue}%</span>
        <span className="mt-1 text-xs font-medium text-slate-500">Completion</span>
      </div>
    </div>
  );
}

function BehaviorLevelBento({ level, behaviorScore }) {
  const [mounted, setMounted] = useState(false);

  // Kick the fill off at 0 and let it transition to its real width right
  // after mount, so the bar visibly slides in every time the profile opens.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const pct = Math.max(0, Math.min(100, Math.round((behaviorScore / 1000) * 100)));
  const tier = behaviorScore >= 750 ? "Elite" : behaviorScore >= 500 ? "Trusted" : "Building Trust";

  return (
    <section className="mt-6 rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Trust &amp; Behavior Level</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            Level {level} ({tier})
          </h2>
        </div>
        <p className="text-lg font-bold text-slate-900">{behaviorScore} / 1000 Pts</p>
      </div>
      <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#FF6B35] transition-all duration-1000 ease-out"
          style={{ width: mounted ? `${pct}%` : "0%" }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Top-tier delivery behavior based on responsiveness, completion quality, and client follow-through.
      </p>
    </section>
  );
}

function QuickStatsCard({ profile }) {
  const stats = [
    { label: "Jobs Completed", value: "42" },
    { label: "On-Time Delivery", value: "98%" },
    { label: "Response Time", value: "1 hr" },
  ];

  return (
    <ProfileCard>
      <h2 className="text-lg font-bold text-slate-900">Quick Stats</h2>
      <div className="mt-5 divide-y divide-slate-100">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <span className="text-sm font-medium text-slate-500">{stat.label}</span>
            <span className="text-sm font-bold text-slate-900">{stat.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricBlock label="Level" value={profile.level} />
        <MetricBlock label="Rating" value={profile.rating} />
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Background verified
      </div>
    </ProfileCard>
  );
}

function LanguagesCard({ languages }) {
  return (
    <ProfileCard>
      <div className="flex items-center gap-2">
        <Languages className="h-5 w-5 text-slate-400" />
        <h2 className="text-lg font-bold text-slate-900">Languages</h2>
      </div>
      <div className="mt-5 space-y-3">
        {languages.map((language) => (
          <div key={language.id} className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-slate-600">{language.name}</span>
            <span className="font-bold text-slate-900">{language.proficiency}</span>
          </div>
        ))}
      </div>
    </ProfileCard>
  );
}

function ReviewCard({ initials, name, role, text }) {
  return (
    <article className="rounded-lg bg-slate-50 p-5 ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
          {initials}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{name}</h3>
          <p className="text-xs font-medium text-slate-500">{role}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-sm italic leading-6 text-slate-500">"{text}"</p>
    </article>
  );
}

function ProficiencyDots({ level }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${level} out of 5 proficiency`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`h-1.5 w-1.5 rounded-full ${index < level ? "bg-[#FF6B35]" : "bg-slate-200"}`}
        />
      ))}
    </span>
  );
}

function SkillMatrix({ skills }) {
  const knownSkills = {
    "React": { category: "Development", level: 5 },
    "TypeScript": { category: "Development", level: 5 },
    "Node.js": { category: "Development", level: 4 },
    "PostgreSQL": { category: "Data", level: 4 },
    "REST APIs": { category: "Development", level: 5 },
    "AWS": { category: "Infrastructure", level: 4 },
    "Docker": { category: "Infrastructure", level: 4 },
    "Next.js": { category: "Development", level: 4 },
  };

  const groups = skills.reduce((result, skill) => {
    const meta = knownSkills[skill] || { category: "Other", level: 3 };
    if (!result[meta.category]) result[meta.category] = [];
    result[meta.category].push({ name: skill, level: meta.level });
    return result;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([category, categorySkills]) => (
        <div key={category}>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{category}</h3>
          <div className="mt-3 space-y-2">
            {categorySkills.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm font-semibold text-slate-700">{skill.name}</span>
                <ProficiencyDots level={skill.level} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricBlock({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  );
}

function ActivityCard({ item, editing, onEdit, onSave, onCancel, onDelete, onChange }) {
  if (editing) {
    return (
      <article className="mb-4 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Client" value={item.client} onChange={(value) => onChange("client", value)} />
          <TextInput label="Client Initials" value={item.initials} onChange={(value) => onChange("initials", value)} />
          <TextInput label="Project Title" value={item.title} onChange={(value) => onChange("title", value)} />
          <CurrencyInput label="Budget" value={item.budget} onChange={(value) => onChange("budget", value)} />
          <TextInput label="Status" value={item.status} onChange={(value) => onChange("status", value)} />
          <TextInput label="Date" value={item.date} onChange={(value) => onChange("date", value)} />
          <div className="sm:col-span-2">
            <TextArea label="Project Details" value={item.description} onChange={(value) => onChange("description", value)} />
          </div>
          <div className="sm:col-span-2">
            <TextInput label="Tags, comma separated" value={tagsToString(item.tags)} onChange={(value) => onChange("tags", stringToTags(value))} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B3FAB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#15338d]"
          >
            <Save className="h-4 w-4" />
            Save project
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="mb-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
            {item.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.status}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {item.client} - {item.date}
            </p>
          </div>
        </div>
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
      </div>

      <div className="mt-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
          <p className="text-sm font-bold text-slate-800">{formatINR(item.budget)}</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

function PortfolioCard({ item, editing, onEdit, onSave, onCancel, onDelete, onChange }) {
  if (editing) {
    return (
      <article className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <TextInput label="Portfolio Title" value={item.title} onChange={(value) => onChange("title", value)} />
          <CurrencyInput label="Budget" value={item.budget} onChange={(value) => onChange("budget", value)} />
          <TextArea label="Summary" value={item.summary} onChange={(value) => onChange("summary", value)} rows={3} />
          <TextInput label="Tags, comma separated" value={tagsToString(item.tags)} onChange={(value) => onChange("tags", stringToTags(value))} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B3FAB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#15338d]"
          >
            <Save className="h-4 w-4" />
            Save work
          </button>
        </div>
      </article>
    );
  }

  const initials = item.title
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <article className="group overflow-hidden rounded-lg bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.11)]">
      {item.image ? (
        <img src={item.image} alt="" className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 items-center justify-center bg-[#F1F5F9]">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.18em]">{initials}</span>
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35]">
          <Briefcase className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
        <p className="mt-2 text-sm font-semibold text-slate-700">{formatINR(item.budget)}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm font-bold text-[#FF6B35] hover:text-[#e95c25]"
          >
            View project
          </a>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function WorkerProfile() {
  const { currentUser, updateWorkerAvatar } = usePlatformData();
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [draftProfile, setDraftProfile] = useState(initialProfile);
  const [skillInput, setSkillInput] = useState("");
  const [editingHero, setEditingHero] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillsDraft, setSkillsDraft] = useState(tagsToString(initialProfile.skills));
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [activityDrafts, setActivityDrafts] = useState(initialProfile.activities);
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [portfolioDrafts, setPortfolioDrafts] = useState(initialProfile.portfolio);

  const openEditModal = () => {
    setDraftProfile({
      ...profile,
      activities: profile.activities.map((item) => ({ ...item })),
      education: profile.education.map((item) => ({ ...item })),
      portfolio: profile.portfolio.map((item) => ({ ...item })),
      languages: profile.languages.map((item) => ({ ...item })),
      skills: [...profile.skills],
    });
    setSkillInput("");
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setDraftProfile(profile);
    setSkillInput("");
    setEditOpen(false);
  };

  const updateDraftField = (field, value) => {
    setDraftProfile((current) => ({ ...current, [field]: value }));
  };

  const saveEditModal = () => {
    const detailsResult = profileDetailsSchema.safeParse(draftProfile);
    if (!detailsResult.success) {
      window.alert(firstValidationError(detailsResult));
      return;
    }

    const skillsResult = skillsSchema.safeParse(draftProfile.skills);
    if (!skillsResult.success) {
      window.alert(firstValidationError(skillsResult));
      return;
    }

    for (const activity of draftProfile.activities) {
      const result = activitySchema.safeParse(activity);
      if (!result.success) {
        window.alert(firstValidationError(result));
        return;
      }
    }

    const languages = draftProfile.languages
      .map((language) => ({
        ...language,
        name: language.name.trim(),
        proficiency: language.proficiency || "Basic",
      }))
      .filter((language) => language.name);

    const education = draftProfile.education
      .map((item) => ({
        ...item,
        degree: item.degree.trim(),
        institution: item.institution.trim(),
        year: item.year.trim(),
      }))
      .filter((item) => item.degree || item.institution || item.year);

    const portfolio = draftProfile.portfolio
      .map((item) => ({
        ...item,
        title: item.title.trim(),
        summary: item.summary.trim(),
        link: (item.link || "").trim(),
        budget: item.budget || 0,
        tags: item.tags?.length ? item.tags : ["Portfolio"],
      }))
      .filter((item) => item.title || item.summary || item.link);

    setProfile((current) => ({
      ...current,
      ...detailsResult.data,
      skills: skillsResult.data,
      activities: draftProfile.activities,
      education,
      portfolio,
      languages,
    }));
    setEditOpen(false);
  };

  const startSkillsEdit = () => {
    setSkillsDraft(tagsToString(profile.skills));
    setEditingSkills(true);
  };

  const saveSkillsEdit = () => {
    const result = skillsSchema.safeParse(stringToTags(skillsDraft));
    if (!result.success) {
      window.alert(firstValidationError(result));
      return;
    }

    setProfile((current) => ({ ...current, skills: result.data }));
    setEditingSkills(false);
  };

  const addDraftSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill) return;
    setDraftProfile((current) => ({
      ...current,
      skills: current.skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase())
        ? current.skills
        : [...current.skills, nextSkill],
    }));
    setSkillInput("");
  };

  const removeDraftSkill = (skillToRemove) => {
    setDraftProfile((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const updateDraftExperience = (id, field, value) => {
    setDraftProfile((current) => ({
      ...current,
      activities: current.activities.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addDraftExperience = () => {
    const nextId = Math.max(0, ...draftProfile.activities.map((item) => item.id)) + 1;
    setDraftProfile((current) => ({
      ...current,
      activities: [
        ...current.activities,
        {
          id: nextId,
          client: "New Client",
          initials: "NC",
          title: "New Experience",
          budget: 0,
          description: "Describe the project outcome and client value here.",
          tags: ["Skill"],
          status: "Completed a standard project",
          date: "Today",
        },
      ],
    }));
  };

  const removeDraftExperience = (id) => {
    setDraftProfile((current) => ({
      ...current,
      activities: current.activities.filter((item) => item.id !== id),
    }));
  };

  const updateDraftEducation = (id, field, value) => {
    setDraftProfile((current) => ({
      ...current,
      education: current.education.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addDraftEducation = () => {
    const nextId = Math.max(0, ...draftProfile.education.map((item) => item.id)) + 1;
    setDraftProfile((current) => ({
      ...current,
      education: [...current.education, { id: nextId, degree: "", institution: "", year: "" }],
    }));
  };

  const removeDraftEducation = (id) => {
    setDraftProfile((current) => ({
      ...current,
      education: current.education.filter((item) => item.id !== id),
    }));
  };

  const updateDraftLanguage = (id, field, value) => {
    setDraftProfile((current) => ({
      ...current,
      languages: current.languages.map((language) =>
        language.id === id ? { ...language, [field]: value } : language
      ),
    }));
  };

  const addDraftLanguage = () => {
    const nextId = Math.max(0, ...draftProfile.languages.map((language) => language.id)) + 1;
    setDraftProfile((current) => ({
      ...current,
      languages: [...current.languages, { id: nextId, name: "", proficiency: "Basic" }],
    }));
  };

  const removeDraftLanguage = (id) => {
    setDraftProfile((current) => ({
      ...current,
      languages: current.languages.filter((language) => language.id !== id),
    }));
  };

  const updateDraftPortfolio = (id, field, value) => {
    setDraftProfile((current) => ({
      ...current,
      portfolio: current.portfolio.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addDraftPortfolio = () => {
    const nextId = Math.max(0, ...draftProfile.portfolio.map((item) => item.id)) + 1;
    setDraftProfile((current) => ({
      ...current,
      portfolio: [
        ...current.portfolio,
        {
          id: nextId,
          title: "",
          budget: 0,
          summary: "",
          link: "",
          tags: ["Portfolio"],
        },
      ],
    }));
  };

  const removeDraftPortfolio = (id) => {
    setDraftProfile((current) => ({
      ...current,
      portfolio: current.portfolio.filter((item) => item.id !== id),
    }));
  };

  const addActivity = () => {
    const nextId = Math.max(0, ...profile.activities.map((item) => item.id)) + 1;
    const nextActivity = {
      id: nextId,
      client: "New Client",
      initials: "NC",
      title: "New Project",
      budget: 0,
      description: "Describe the project outcome and client value here.",
      tags: ["Skill"],
      status: "Completed a standard project",
      date: "Today",
    };
    setProfile((current) => ({ ...current, activities: [nextActivity, ...current.activities] }));
    setActivityDrafts((current) => [nextActivity, ...current]);
    setEditingActivityId(nextId);
  };

  const updateActivityDraft = (id, field, value) => {
    setActivityDrafts((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const saveActivity = (id) => {
    const nextActivity = activityDrafts.find((item) => item.id === id);
    if (!nextActivity) return;
    const result = activitySchema.safeParse(nextActivity);
    if (!result.success) {
      window.alert(firstValidationError(result));
      return;
    }

    setProfile((current) => ({
      ...current,
      activities: current.activities.map((item) => (item.id === id ? result.data : item)),
    }));
    setActivityDrafts((current) =>
      current.map((item) => (item.id === id ? result.data : item))
    );
    setEditingActivityId(null);
  };

  const cancelActivity = () => {
    setActivityDrafts(profile.activities);
    setEditingActivityId(null);
  };

  const deleteActivity = (id) => {
    setProfile((current) => ({
      ...current,
      activities: current.activities.filter((item) => item.id !== id),
    }));
    setActivityDrafts((current) => current.filter((item) => item.id !== id));
  };

  const addPortfolioItem = () => {
    const nextId = Math.max(0, ...profile.portfolio.map((item) => item.id)) + 1;
    const nextItem = {
      id: nextId,
      title: "New Portfolio Project",
      budget: 0,
      summary: "Describe the project, results, and technologies used.",
      tags: ["Skill"],
    };
    setProfile((current) => ({ ...current, portfolio: [nextItem, ...current.portfolio] }));
    setPortfolioDrafts((current) => [nextItem, ...current]);
    setEditingPortfolioId(nextId);
  };

  const updatePortfolioDraft = (id, field, value) => {
    setPortfolioDrafts((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const savePortfolioItem = (id) => {
    const nextItem = portfolioDrafts.find((item) => item.id === id);
    if (!nextItem) return;
    const result = portfolioSchema.safeParse(nextItem);
    if (!result.success) {
      window.alert(firstValidationError(result));
      return;
    }

    setProfile((current) => ({
      ...current,
      portfolio: current.portfolio.map((item) => (item.id === id ? result.data : item)),
    }));
    setPortfolioDrafts((current) =>
      current.map((item) => (item.id === id ? result.data : item))
    );
    setEditingPortfolioId(null);
  };

  const cancelPortfolioItem = () => {
    setPortfolioDrafts(profile.portfolio);
    setEditingPortfolioId(null);
  };

  const deletePortfolioItem = (id) => {
    setProfile((current) => ({
      ...current,
      portfolio: current.portfolio.filter((item) => item.id !== id),
    }));
    setPortfolioDrafts((current) => current.filter((item) => item.id !== id));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newImageUrl = URL.createObjectURL(file);
    updateWorkerAvatar(currentUser?.id, newImageUrl);
    event.target.value = "";
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC]">
      <main className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 pt-8">
          <section className="overflow-hidden rounded-lg bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
            <div className="h-32 bg-[radial-gradient(circle_at_18%_30%,rgba(255,107,53,0.28),transparent_28%),linear-gradient(120deg,#0F172A_0%,#334155_50%,#FF6B35_100%)] sm:h-40" />
            <div className="px-6 pb-7 sm:px-8">
              <div className="-mt-16 flex flex-col gap-5 rounded-lg bg-slate-950/55 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="worker-avatar-upload"
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor="worker-avatar-upload"
                      className="group relative h-28 w-28 flex-none cursor-pointer"
                      aria-label={`Update profile photo for ${profile.name}`}
                      title="Update profile photo"
                    >
                      <img
                        src={currentUser?.avatar || defaultAvatarUrl}
                        alt={`${profile.name} profile`}
                        className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                      />
                      <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.16)]" />
                      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Camera className="h-6 w-6 text-white" />
                      </span>
                    </label>
                    <div className="pb-1">
                      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{profile.name}</h1>
                      <p className="mt-2 text-lg font-medium text-white/85">{profile.role}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-white/75">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-white/65" />
                          {profile.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-bold text-white ring-1 ring-white/20">
                          <Sparkles className="h-4 w-4" />
                          Elite Member
                        </span>
                        <Badge tone="gold">
                          <Trophy className="h-3.5 w-3.5" />
                          Level {profile.level}
                        </Badge>
                        <Badge tone="green">
                          <Star className="h-3.5 w-3.5 fill-emerald-600" />
                          {profile.rating}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Profile
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setShareOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(255,107,53,0.24)] transition hover:-translate-y-0.5 hover:bg-[#e95c25]"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Profile
                    </button>
                  </div>
                </div>
              </div>
          </section>

          <BehaviorLevelBento level={profile.level} behaviorScore={profile.behaviorScore} />

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
            <div className="space-y-8">
              <SectionCard title="About Me">
                <p className="max-w-4xl text-[15px] leading-7 text-slate-600">{profile.bio}</p>
                <button type="button" className="mt-3 text-sm font-bold text-[#FF6B35]">Read more</button>
              </SectionCard>

              <SectionCard title="Portfolio & Work">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {profile.portfolio.map((item) => {
                    const draft = portfolioDrafts.find((draftItem) => draftItem.id === item.id) || item;
                    return (
                      <PortfolioCard
                        key={item.id}
                        item={editingPortfolioId === item.id ? draft : item}
                        editing={editingPortfolioId === item.id}
                        onEdit={() => {
                          setPortfolioDrafts(profile.portfolio);
                          setEditingPortfolioId(item.id);
                        }}
                        onSave={() => savePortfolioItem(item.id)}
                        onCancel={cancelPortfolioItem}
                        onDelete={() => deletePortfolioItem(item.id)}
                        onChange={(field, value) => updatePortfolioDraft(item.id, field, value)}
                      />
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard title="Experience & Education">
                <div className="relative space-y-5 before:absolute before:left-5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-200">
                  {profile.activities.map((item) => {
                    const draft = activityDrafts.find((draftItem) => draftItem.id === item.id) || item;
                    return (
                      <div key={item.id} className="relative flex gap-5">
                        <div className="relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-orange-50 text-[#FF6B35] ring-8 ring-white">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <ActivityCard
                            item={editingActivityId === item.id ? draft : item}
                            editing={editingActivityId === item.id}
                            onEdit={() => {
                              setActivityDrafts(profile.activities);
                              setEditingActivityId(item.id);
                            }}
                            onSave={() => saveActivity(item.id)}
                            onCancel={cancelActivity}
                            onDelete={() => deleteActivity(item.id)}
                            onChange={(field, value) => updateActivityDraft(item.id, field, value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {profile.education.map((item) => (
                    <div key={item.id} className="relative flex gap-5">
                      <div className="relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-orange-50 text-[#FF6B35] ring-8 ring-white">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Education</p>
                        <h3 className="mt-1 text-base font-bold text-slate-900">{item.degree}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {item.institution} - {item.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Client Reviews">
                <div className="grid gap-5 md:grid-cols-2">
                  <ReviewCard
                    initials="AM"
                    name="Aarav Menon"
                    role="Founder, FinEdge India"
                    text="Priya brought immediate structure to a complex build. Her delivery notes and implementation quality made handoff effortless."
                  />
                  <ReviewCard
                    initials="MI"
                    name="Meera Iyer"
                    role="Head of Product, Nova Studio"
                    text="One of the clearest collaborators we have worked with. Reliable, thoughtful, and consistently ahead of deadlines."
                  />
                </div>
              </SectionCard>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <QuickStatsCard profile={profile} />
              <ProfileCard>
                <h2 className="text-lg font-bold text-slate-900">Skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </ProfileCard>
              <LanguagesCard languages={profile.languages} />
              <section className="rounded-lg bg-[#0F172A] p-6 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
                <div className="flex items-center gap-2 text-sm font-semibold text-orange-100">
                  <Clock3 className="h-4 w-4 text-[#FF6B35]" />
                  Available this week
                </div>
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e95c25]">
                  <Send className="h-4 w-4" />
                  Start a Contract
                </button>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <EditProfileModal
        open={editOpen}
        draft={draftProfile}
        skillInput={skillInput}
        onClose={closeEditModal}
        onSave={saveEditModal}
        onChange={updateDraftField}
        onSkillInputChange={setSkillInput}
        onAddSkill={addDraftSkill}
        onRemoveSkill={removeDraftSkill}
        onExperienceChange={updateDraftExperience}
        onAddExperience={addDraftExperience}
        onRemoveExperience={removeDraftExperience}
        onEducationChange={updateDraftEducation}
        onAddEducation={addDraftEducation}
        onRemoveEducation={removeDraftEducation}
        onLanguageChange={updateDraftLanguage}
        onAddLanguage={addDraftLanguage}
        onRemoveLanguage={removeDraftLanguage}
        onPortfolioChange={updateDraftPortfolio}
        onAddPortfolio={addDraftPortfolio}
        onRemovePortfolio={removeDraftPortfolio}
      />
      <ShareProfileModal open={shareOpen} onClose={() => setShareOpen(false)} profile={profile} />
    </div>
  );
}
