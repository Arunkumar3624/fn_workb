import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  IndianRupee,
  Link2,
  Lock,
  Plus,
  ShieldCheck,
  Star,
  X,
  Zap,
} from "lucide-react";
import LockedCurrencyInput from "../common/LockedCurrencyInput";
import { formatINR, postJobSchema } from "../../utils/formValidation";
import { trackEvent } from "../../lib/analytics";
import { createProject } from "../../lib/projectsApi";
import { submitLink } from "../../lib/submissionsApi";
import { ApiError } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";

// ── Constants ─────────────────────────────────────────────────────────────

const TIER_BUDGET = {
  Micro: 1000,
  Standard: 6000,
  Professional: 30000,
  Enterprise: 75000,
};

const CATEGORIES = [
  "Tech & Development",
  "Design & Creative",
  "Writing & Content",
  "Marketing & Growth",
  "Data & Research",
  "AI & Automation",
  "Finance & Accounting",
  "Legal & Compliance",
  "Operations & Logistics",
  "Video & Animation",
  "Customer Support",
];

// today's ISO date string for min attribute — blocks all past dates
const TODAY = new Date().toISOString().split("T")[0];

// ── Style helpers ─────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] transition-colors";

const currencyInputCls =
  "w-full pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] transition-colors";

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
      {children}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  );
}

function SectionCard({ icon: Icon, title, sub, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-[#F4F6FF] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#1B3FAB]" />
        </div>
        <div>
          <h2
            className="font-bold text-[#0F172A] text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h2>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

export default function BusinessPostJob({ onVerify, isVerified, onJobPosted }) {
  const { currentUser } = useAuth();
  const [urgent, setUrgent] = useState(false);
  const [refLinks, setRefLinks] = useState([""]);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      title: "",
      category: "Tech & Development",
      tier: "Professional",
      brief: "",
      skills: "",
      deadline: "",
      budget: 30000,
    },
  });

  const rawBudget = Number(watch("budget")) || 0;
  const watchedTier = watch("tier");
  // When user clears the budget field, fall back to the tier's default for the summary display
  const summaryBudget = rawBudget > 0 ? rawBudget : TIER_BUDGET[watchedTier];
  const platformFee = Math.round(summaryBudget * 0.08);
  const totalDeposit = summaryBudget + platformFee;

  const watchedTitle = watch("title");
  const watchedCategory = watch("category");
  const watchedBrief = watch("brief");
  const watchedSkills = watch("skills");
  const watchedDeadline = watch("deadline");

  // Destructure to compose tier onChange with budget auto-sync
  const { onChange: onTierChange, ...tierRegisterRest } = register("tier");

  // Only title/description/budget/deadline map to the real `projects` table
  // (schema has no category/tier/skills/urgent columns) — skills are folded
  // into the description text rather than silently dropped. Posting
  // (workerId omitted) creates a real OPEN project — it goes live on the
  // public Job Feed immediately, no forced "pick a worker" step. A specific
  // worker can still be brought in later, either through their own
  // application or a direct "Invite to Job" from Find Workers.
  const onSubmit = async (formData) => {
    setPosting(true);
    setPostError("");
    try {
      trackEvent("JobPosted", { tier: watchedTier, category: watchedCategory, budget: summaryBudget });

      const project = await createProject({
        title: formData.title,
        description: formData.skills ? `${formData.brief}\n\nSkills: ${formData.skills}` : formData.brief,
        budget: summaryBudget,
        deadline: formData.deadline || undefined,
      });

      const referenceLinks = refLinks.map((link) => link.trim()).filter(Boolean);
      if (referenceLinks.length > 0) {
        await Promise.allSettled(
          referenceLinks.map((url) =>
            submitLink({ projectId: project.id, url, caption: "Reference material shared at posting time" })
          )
        );
      }

      onJobPosted?.(project);
    } catch (err) {
      setPostError(err instanceof ApiError ? err.message : "Could not post this job.");
    } finally {
      setPosting(false);
    }
  };

  // Reference link helpers
  const addRefLink = () => {
    if (refLinks.length < 5) setRefLinks((prev) => [...prev, ""]);
  };
  const removeRefLink = (idx) =>
    setRefLinks((prev) => prev.filter((_, i) => i !== idx));
  const updateRefLink = (idx, value) =>
    setRefLinks((prev) => prev.map((v, i) => (i === idx ? value : v)));

  if (!isVerified) {
    return <PostJobGate onVerify={onVerify} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-7 wb-tab-enter">
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-extrabold text-[#0F172A]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Post a New Job
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Your payment is held securely and only released after you approve the work.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* ── Left Column: Form Wizard ─────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Card 1: Basic Details */}
              <SectionCard
                icon={Briefcase}
                title="Basic Details"
                sub="Set the job title, category, and talent tier"
              >
                <div>
                  <FieldLabel>Job Title</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. React Developer for Analytics Dashboard"
                    {...register("title", { setValueAs: (v) => v.trim() })}
                    className={inputCls}
                  />
                  <FieldError message={errors.title?.message} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category — free-text combobox with suggestions */}
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <input
                      list="wb-category-list"
                      {...register("category")}
                      placeholder="Type or choose…"
                      className={inputCls}
                    />
                    <datalist id="wb-category-list">
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    <FieldError message={errors.category?.message} />
                  </div>

                  {/* Budget Tier — auto-updates Budget field */}
                  <div>
                    <FieldLabel>Budget Tier</FieldLabel>
                    <select
                      {...tierRegisterRest}
                      onChange={(e) => {
                        onTierChange(e);
                        setValue("budget", TIER_BUDGET[e.target.value], {
                          shouldValidate: true,
                        });
                      }}
                      className={inputCls}
                    >
                      <option value="Micro">Micro (₹500 – ₹2,000)</option>
                      <option value="Standard">Standard (₹2,000 – ₹10,000)</option>
                      <option value="Professional">Professional (₹10,000 – ₹50,000)</option>
                      <option value="Enterprise">Enterprise (₹50,000+)</option>
                    </select>
                  </div>
                </div>
              </SectionCard>

              {/* Card 2: Project Brief & Requirements */}
              <SectionCard
                icon={FileText}
                title="Project Brief & Requirements"
                sub="Describe scope, deliverables, and required skills"
              >
                <div>
                  <FieldLabel>Project Brief</FieldLabel>
                  <textarea
                    rows={5}
                    placeholder="Describe scope, deliverables, and key requirements..."
                    {...register("brief", { setValueAs: (v) => v.trim() })}
                    className={`${inputCls} resize-none`}
                  />
                  <FieldError message={errors.brief?.message} />
                </div>

                <div>
                  <FieldLabel>Required Skills</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, PostgreSQL (comma separated)"
                    {...register("skills", { setValueAs: (v) => v.trim() })}
                    className={inputCls}
                  />
                  <FieldError message={errors.skills?.message} />
                </div>
              </SectionCard>

              {/* Card 3: Budget & Timeline */}
              <SectionCard
                icon={Clock}
                title="Budget & Timeline"
                sub="Set your project budget and delivery deadline"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Deadline</FieldLabel>
                    {/* min=TODAY prevents selecting past dates */}
                    <input
                      type="date"
                      min={TODAY}
                      {...register("deadline")}
                      className={inputCls}
                    />
                    <FieldError message={errors.deadline?.message} />
                  </div>
                  <div>
                    <FieldLabel>Budget (₹)</FieldLabel>
                    <LockedCurrencyInput
                      value={rawBudget || ""}
                      onChange={(value) =>
                        setValue("budget", value, { shouldValidate: true })
                      }
                      inputClassName={currencyInputCls}
                    />
                    {rawBudget === 0 && (
                      <p className="mt-1.5 text-xs text-slate-400">
                        Showing tier minimum ₹{TIER_BUDGET[watchedTier].toLocaleString("en-IN")} in summary
                      </p>
                    )}
                    <FieldError message={errors.budget?.message} />
                  </div>
                </div>

                {/* Urgent toggle */}
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div>
                    <div className="text-sm font-bold text-amber-800">
                      Urgent Matching (2-hour response)
                    </div>
                    <div className="text-xs text-amber-600 mt-0.5">
                      Platform fast-tracks your project to top-matched talent
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUrgent(!urgent)}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ml-4 ${
                      urgent ? "bg-amber-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-sm ${
                        urgent ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </SectionCard>

              {/* Card 4: Reference Materials */}
              <SectionCard
                icon={Link2}
                title="Reference Materials"
                sub="Add links, docs, or videos to help workers understand the task"
              >
                <div className="space-y-3">
                  {refLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="flex items-center gap-2 flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-[#1B3FAB]/20 focus-within:border-[#1B3FAB] transition-colors">
                        <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => updateRefLink(idx, e.target.value)}
                          placeholder="https://drive.google.com/… or YouTube link, Figma, Notion…"
                          className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-slate-400 outline-none"
                        />
                      </div>
                      {refLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRefLink(idx)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {refLinks.length < 5 && (
                    <button
                      type="button"
                      onClick={addRefLink}
                      className="flex items-center gap-2 text-xs font-bold text-[#1B3FAB] hover:text-[#1635A0] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add another reference
                    </button>
                  )}
                </div>

                {/* Privacy notice */}
                <div className="flex items-start gap-2.5 p-4 bg-blue-50 border border-blue-100 rounded-xl mt-2">
                  <Eye className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-800">Private by default</p>
                    <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                      Workers will <strong>not</strong> see these links when browsing job listings.
                      Once someone is assigned to this job, each link is sent for a quick WorkBridge review before
                      it's shared with them — the same check every submitted file goes through.
                    </p>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* ── Right Column: Sticky Sidebar ─────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">

                {/* ── Job Preview Card (styled exactly like WorkerJobFeed) ── */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-xs font-bold uppercase tracking-widest text-slate-400"
                    >
                      Worker Preview
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>

                  {/* ── The actual preview card — mirrors WorkerJobFeed article ── */}
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 truncate">
                          {watchedCategory || "Category"}
                        </p>
                        <h2
                          className="mt-1.5 text-sm font-black leading-snug text-slate-900"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {watchedTitle || (
                            <span className="text-slate-300 font-normal">Your job title…</span>
                          )}
                        </h2>
                      </div>
                      <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </span>
                    </div>

                    {/* Business + Budget chips — real data, not a placeholder
                        company name, since this is a preview of what the
                        current logged-in business's own post looks like. */}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                        <Briefcase className="h-3 w-3" />
                        {currentUser?.name || "Your business"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                        <IndianRupee className="h-3 w-3" />
                        {summaryBudget > 0 ? `₹${summaryBudget.toLocaleString("en-IN")}` : "Budget"}
                      </span>
                    </div>

                    {/* Brief */}
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {watchedBrief || (
                        <span className="text-slate-300">Project description will appear here…</span>
                      )}
                    </p>

                    {/* Stats: Applicants | Type | Rating — budget already
                        shown in the chip row above, so this slot shows
                        something a real posted listing will actually have:
                        how many people have applied. Always 0 here since
                        this is an unposted draft. */}
                    <div className="mt-3 grid grid-cols-3 gap-0 rounded-xl border border-slate-200 bg-slate-50 text-center text-[11px] overflow-hidden">
                      <div className="py-2.5 px-1">
                        <p className="text-slate-400">Applicants</p>
                        <p className="mt-0.5 font-black text-slate-900">0</p>
                      </div>
                      <div className="py-2.5 px-1 border-x border-slate-200">
                        <p className="text-slate-400">Type</p>
                        <p className="mt-0.5 font-black text-slate-900">Fixed</p>
                      </div>
                      <div className="py-2.5 px-1">
                        <p className="text-slate-400">Rating</p>
                        <p className="mt-0.5 font-black text-slate-900 inline-flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          4.8
                        </p>
                      </div>
                    </div>

                    {/* Skills tags */}
                    {watchedSkills && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {watchedSkills
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Footer row */}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                        <Clock className="h-3 w-3" />
                        Just now
                      </span>
                      <div className="flex items-center gap-1.5">
                        {urgent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <Zap className="h-2.5 w-2.5" />
                            Urgent
                          </span>
                        )}
                        {watchedDeadline && (
                          <span className="text-[10px] text-slate-400">
                            Due{" "}
                            {new Date(watchedDeadline).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dummy CTA — shows workers what they will see */}
                    <div className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-center text-xs font-bold text-slate-400 cursor-default select-none">
                      View Details (worker view)
                    </div>
                  </article>

                  <p className="mt-3 text-center text-[11px] text-slate-400">
                    This is exactly how workers see your listing
                  </p>
                </div>

                {/* ── Payment Summary + CTA ── */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F6FF] flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[#1B3FAB]" />
                    </div>
                    <h3
                      className="text-sm font-bold text-[#0F172A]"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Payment Summary
                    </h3>
                  </div>

                  <div
                    className="space-y-2.5 text-sm mb-5"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Project Budget</span>
                      <span className="font-semibold text-[#0F172A]">
                        {formatINR(summaryBudget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Platform Fee (8%)</span>
                      <span className="font-semibold text-[#0F172A]">
                        {formatINR(platformFee)}
                      </span>
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A]">Total to Deposit</span>
                      <span
                        className="font-extrabold text-[#FF6B35] text-base"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {formatINR(totalDeposit)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your job goes live on the Job Feed right away so any worker can apply — funds are only held once you
                      accept someone, and released after you approve the delivered work. You can also invite a specific
                      worker directly from Find Workers at any time while it's open.
                    </p>
                  </div>

                  {postError && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{postError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={posting}
                    className="w-full py-4 bg-[#FF6B35] hover:bg-[#E55E1F] text-white rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {posting ? "Posting…" : "Post Job — Go Live"}
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

// ── Verification Gate ─────────────────────────────────────────────────────
// DO NOT MODIFY: gates unverified businesses from posting jobs.
function PostJobGate({ onVerify }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center min-h-[80vh] wb-tab-enter">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-orange-50 border-2 border-orange-100 rounded-3xl flex items-center justify-center">
          <Lock className="w-10 h-10 text-[#FF6B2C]" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#FF6B2C] rounded-full flex items-center justify-center shadow-md shadow-orange-200">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      </div>

      <h2
        className="text-2xl font-extrabold text-[#0A1128] mb-3"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Verify your business first
      </h2>
      <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">
        Before posting jobs on WorkBridge, your business must be verified.
        This is a <strong className="text-slate-700">one-time process</strong> that protects freelancers
        and ensures only legitimate companies can hire on the platform.
      </p>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full mb-8 shadow-sm text-left space-y-3">
        {[
          { emoji: "Shield", text: "Prevents fake or fraudulent job listings" },
          { emoji: "Trust", text: "Gives freelancers confidence to apply" },
          { emoji: "Launch", text: "Unlocks unlimited project posting" },
          { emoji: "Fast", text: "One-time verification - done in minutes" },
        ].map(({ emoji, text }, i) => (
          <div
            key={text}
            className="flex items-center gap-3 wb-card-enter"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="text-xs font-bold text-[#FF6B2C] flex-shrink-0">{emoji}</span>
            <span className="text-sm text-slate-600">{text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onVerify}
        className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#FF6B2C] to-rose-500 text-white rounded-2xl font-bold text-base shadow-xl shadow-orange-200 hover:opacity-90 hover:-translate-y-1 transition-all duration-200 group"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <CheckCircle2 className="w-5 h-5" />
        Verify My Business - ₹470.82
        <span className="text-white/70 text-sm font-normal">one-time</span>
      </button>
      <p className="text-xs text-slate-400 mt-3">
        Lifetime verified status - No recurring fees - Review in 24-48 hrs
      </p>
    </div>
  );
}
