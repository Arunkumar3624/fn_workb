import { useState } from "react";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Avatar from "../shared/Avatar";

// ── Static data ───────────────────────────────────────────────────────────────

const INITIAL_PROFILE = {
  name: "RetailX Pvt Ltd",
  initials: "RX",
  coverImage: "",
  tagline: "India's fastest-growing D2C e-commerce enabler",
  industry: "E-Commerce Technology",
  location: "Mumbai, India",
  size: "51–200 employees",
  founded: "2019",
  website: "https://retailx.in",
  email: "hr@retailx.in",
  bio: "RetailX is India's fastest-growing D2C e-commerce enabler, powering 500+ brands with end-to-end technology solutions — from inventory management and payment processing to last-mile logistics. We work with brands across fashion, food, electronics, and lifestyle at every stage from seed to Series C.",
  culture:
    "We move fast, ship often, and believe in outcome-driven work. Our team spans 12 cities across India — remote-first, async-friendly, and deeply collaborative. Freelancers are embedded into our squads and treated as core team members for the full duration of the project.",
};

const COMPANY_JOBS = [
  { id: "j1", title: "AI Chatbot for Customer Support", tier: "Professional", budget: "₹22,000", workload: "Full-time · 1 month", urgent: true, posted: "2 days ago" },
  { id: "j2", title: "React Analytics Dashboard", tier: "Standard", budget: "₹12,000", workload: "Part-time · 2 weeks", urgent: false, posted: "5 days ago" },
  { id: "j3", title: "SEO Audit & Content Strategy", tier: "Micro", budget: "₹5,000", workload: "Flexible · 1 week", urgent: false, posted: "1 week ago" },
];

const WORKER_REVIEWS = [
  {
    id: 1, name: "Priya Sharma", initials: "PS", bg: "bg-[#1B3FAB]", rating: 5,
    role: "Full-Stack Developer", project: "E-Commerce Platform Dev",
    text: "RetailX were excellent communicators throughout — clear requirements, fast approvals, and payment released within hours of delivery. One of the best clients on WorkBridge.",
    date: "Jun 28, 2026",
  },
  {
    id: 2, name: "Arjun Mehta", initials: "AM", bg: "bg-[#1B3FAB]", rating: 5,
    role: "UI/UX Designer", project: "Brand Identity Design",
    text: "Smooth experience from brief to delivery. They knew exactly what they wanted and gave clear feedback at every milestone. Would happily work with them again.",
    date: "Jul 1, 2026",
  },
  {
    id: 3, name: "Rohit Verma", initials: "RV", bg: "bg-emerald-600", rating: 4,
    role: "Content & SEO Specialist", project: "SEO Content – 20 Articles",
    text: "Great brief, quick responses. Scope was crystal-clear from day one. Minor delay in milestone approvals but overall a solid, professional client.",
    date: "Jul 2, 2026",
  },
];

const VERIFICATIONS = [
  { label: "GST Certificate",      ok: true  },
  { label: "Company PAN",          ok: true  },
  { label: "Director Aadhaar",     ok: true  },
  { label: "Premium Membership",   ok: true  },
  { label: "Business Bank Account", ok: false },
];

const STATS = [
  { label: "Jobs Posted",    value: "42",   Icon: Briefcase,  color: "text-[#1B3FAB]",   bg: "bg-[#F4F6FF]"  },
  { label: "Workers Hired",  value: "28",   Icon: Users,      color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Avg. Rating",    value: "4.7",  Icon: Star,       color: "text-amber-600",   bg: "bg-amber-50"   },
  { label: "Success Rate",   value: "94%",  Icon: TrendingUp, color: "text-[#FF6B35]",   bg: "bg-orange-50"  },
];

const CULTURE_TAGS = ["Remote-First", "Async-Friendly", "Outcome-Driven", "Fast-Paced", "Collaborative"];

// ── Sub-components ───────────────────────────────────────────────────────────

function RatingBar({ label, value, total = 28 }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-10 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-5 flex-shrink-0">{value}</span>
    </div>
  );
}

// ── Profile view ─────────────────────────────────────────────────────────────

function ProfileView({ profile, onEdit }) {
  return (
    <div className="bg-slate-50 wb-tab-enter">

      {/* ── Hero – NO overflow-hidden on this outer wrapper ───────────────── */}
      <div className="border-b border-slate-200 bg-slate-50 p-1">

        {/* Cover banner – overflow-hidden HERE clips the decorative blobs only */}
        <div
          className="relative h-[clamp(270px,31vh,340px)] max-h-[340px] min-h-[270px] overflow-hidden rounded-[20px] bg-[#0F172A] bg-cover bg-center shadow-sm"
          style={
            profile.coverImage
              ? { backgroundImage: `url(${profile.coverImage})` }
              : undefined
          }
        >
          {!profile.coverImage && (
            <>
              <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#1B3FAB] rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-[#FF6B35] rounded-full blur-3xl opacity-15" />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-[#0F172A]/35 to-[#1B3FAB]/50" />

          {/* Edit Profile button inside cover */}
          <button
            onClick={onEdit}
            className="absolute top-4 right-5 flex items-center gap-1.5 px-3 py-1.5 bg-white/12 hover:bg-white/22 backdrop-blur-md border border-white/25 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            Edit Profile
          </button>

          {/* Identity card sits inside the cover so the whole area reads as one header */}
          <div className="absolute inset-x-1 bottom-1 z-10">
            <div className="flex flex-col gap-5 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl backdrop-blur-md sm:flex-row sm:items-center">
            {/* Company logo – z-10 ensures it sits above the cover */}
            <div className="w-[84px] h-[84px] rounded-2xl bg-white p-[4px] shadow-xl ring-1 ring-slate-200 flex-shrink-0">
              <div
                className="w-full h-full bg-[#1B3FAB] rounded-xl flex items-center justify-center text-white font-extrabold text-xl"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {profile.initials}
              </div>
            </div>

            {/* Company info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1
                  className="font-extrabold text-[#0F172A] text-xl leading-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-full border border-amber-200 flex-shrink-0">
                  <Award className="w-3 h-3" /> Premium
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200 flex-shrink-0">
                  <ShieldCheck className="w-3 h-3" /> GST Verified
                </span>
              </div>

              <p className="text-slate-500 text-sm italic mb-2">{profile.tagline}</p>

              {/* Meta chips */}
              <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                {[
                  { Icon: Building2, val: profile.industry },
                  { Icon: MapPin,    val: profile.location  },
                  { Icon: Users,     val: profile.size      },
                  { Icon: Calendar,  val: `Est. ${profile.founded}` },
                ].map(({ Icon, val }) => (
                  <span key={val} className="flex items-center gap-1 text-xs text-slate-500">
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    {val}
                  </span>
                ))}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#1B3FAB] font-semibold hover:underline"
                  >
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    {profile.website.replace("https://", "")}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="px-7 py-6 max-w-[1200px] mx-auto">

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STATS.map(({ label, value, Icon, color, bg }, i) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-3 wb-card-enter"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className={`text-2xl font-extrabold ${color} leading-none`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {label === "Avg. Rating"
                    ? <span className="flex items-center gap-1">{value}<Star className="w-4 h-4 fill-amber-400 text-amber-400" /></span>
                    : value
                  }
                </div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT – main content (2/3) */}
          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>About</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{profile.bio}</p>
            </div>

            {/* Culture */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Culture &amp; Work Style</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{profile.culture}</p>
              <div className="flex flex-wrap gap-2">
                {CULTURE_TAGS.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-[#F4F6FF] text-[#1B3FAB] text-xs font-semibold rounded-full border border-[#1B3FAB]/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Openings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Current Openings</h2>
                <span className="text-xs font-bold text-[#1B3FAB] bg-[#F4F6FF] px-2.5 py-1 rounded-full border border-[#1B3FAB]/10">
                  {COMPANY_JOBS.length} Open
                </span>
              </div>
              <div className="space-y-3">
                {COMPANY_JOBS.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-[#F4F6FF] hover:border-[#1B3FAB]/20 transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-[#1B3FAB] rounded-xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {profile.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#1B3FAB] transition-colors">{job.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{job.tier} · {job.workload} · Posted {job.posted}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-sm font-extrabold text-[#FF6B35]">{job.budget}</span>
                      {job.urgent && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worker Reviews */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Worker Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-extrabold text-[#0F172A]">4.7</span>
                  <span className="text-xs text-slate-400">(28 workers)</span>
                </div>
              </div>

              {/* Rating breakdown */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 space-y-2.5">
                <RatingBar label="5 ★" value={22} />
                <RatingBar label="4 ★" value={4}  />
                <RatingBar label="3 ★" value={1}  />
                <RatingBar label="2 ★" value={1}  />
                <RatingBar label="1 ★" value={0}  />
              </div>

              {/* Review cards */}
              <div className="space-y-4">
                {WORKER_REVIEWS.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Avatar initials={rev.initials} bg={rev.bg} size="w-9 h-9" text="text-xs" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-bold text-[#0F172A] text-sm">{rev.name}</span>
                          <span className="text-xs text-slate-400">{rev.role}</span>
                          <div className="ml-auto flex gap-0.5 flex-shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] font-bold text-[#1B3FAB] mb-1.5">{rev.project}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{rev.text}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">{rev.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT – sidebar (1/3) */}
          <div className="space-y-5">

            {/* Company Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Company Details</h3>
              <div className="space-y-4">
                {[
                  { Icon: Building2, label: "Industry",  val: profile.industry },
                  { Icon: MapPin,    label: "Location",  val: profile.location  },
                  { Icon: Users,     label: "Team Size", val: profile.size      },
                  { Icon: Calendar,  label: "Founded",   val: profile.founded   },
                ].map(({ Icon, label, val }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{val}</p>
                    </div>
                  </div>
                ))}
                {profile.website && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Website</p>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#1B3FAB] hover:underline flex items-center gap-1 mt-0.5">
                        {profile.website.replace("https://", "")}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Contact Email</p>
                      <p className="text-sm font-semibold text-[#0F172A] mt-0.5">{profile.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trust & Verification */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Trust &amp; Verification</h3>
              <div className="space-y-3">
                {VERIFICATIONS.map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? "bg-emerald-50 border border-emerald-200" : "bg-slate-100 border border-slate-200"}`}>
                      <CheckCircle2 className={`w-3 h-3 ${ok ? "text-emerald-500" : "text-slate-300"}`} />
                    </div>
                    <span className={`text-sm flex-1 ${ok ? "font-semibold text-[#0F172A]" : "text-slate-400"}`}>
                      {label}
                    </span>
                    {!ok && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-bold text-emerald-700">Verified &amp; trusted employer</span>
              </div>
            </div>

            {/* Premium benefits */}
            <div className="rounded-2xl overflow-hidden border border-amber-200">
              <div className="bg-gradient-to-r from-amber-500 to-[#FF6B35] px-5 py-3.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-white flex-shrink-0" />
                <span className="font-extrabold text-white text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Premium Employer
                </span>
              </div>
              <div className="bg-amber-50 px-5 py-4">
                <ul className="space-y-2.5">
                  {[
                    "Priority listing on worker job feed",
                    "Early access to top-rated talent",
                    "Dedicated account manager",
                    "Analytics dashboard access",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-amber-800">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Edit CTA */}
            <button
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1B3FAB] text-white rounded-2xl text-sm font-bold hover:bg-[#1635A0] hover:-translate-y-0.5 transition-all duration-200 shadow-md shadow-[#1B3FAB]/20"
            >
              <Edit3 className="w-4 h-4" />
              Edit Company Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit form ─────────────────────────────────────────────────────────────────

function EditForm({ draft, onChange, onSave, onCancel }) {
  const handleCoverUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onChange("coverImage", URL.createObjectURL(file));
    event.target.value = "";
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-slate-50 p-7 pb-12 wb-tab-enter">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Edit Company Profile
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Changes visible to workers on your public profile</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={onSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#1B3FAB] text-white rounded-xl text-sm font-bold hover:bg-[#1635A0] transition-colors shadow-md shadow-[#1B3FAB]/20">
              <Send className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <Field label="Company Name">
            <input value={draft.name ?? ""} onChange={(e) => onChange("name", e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F4F6FF] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB]" />
          </Field>

          <Field label="Header Image">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#0F172A] shadow-sm">
              <div
                className="relative h-[clamp(180px,22vh,260px)] max-h-64 min-h-[180px] bg-cover bg-center"
                style={
                  draft.coverImage
                    ? { backgroundImage: `url(${draft.coverImage})` }
                    : undefined
                }
              >
                {!draft.coverImage && (
                  <>
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#1B3FAB] opacity-60 blur-3xl" />
                    <div className="absolute -bottom-12 left-4 h-28 w-28 rounded-full bg-[#FF6B35] opacity-30 blur-3xl" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-[#0F172A]/35 to-[#1B3FAB]/40" />
                <label
                  htmlFor="company-cover-upload"
                  className="absolute inset-0 flex cursor-pointer items-center justify-center"
                >
                  <span className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-white/25">
                    {draft.coverImage ? "Change header image" : "Upload header image"}
                  </span>
                  <input
                    id="company-cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
              </div>
            </div>
          </Field>

          <Field label="Company Bio">
            <textarea rows={4} value={draft.bio} onChange={(e) => onChange("bio", e.target.value)}
              className="w-full px-4 py-3 bg-[#F4F6FF] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] resize-none" />
          </Field>

          <Field label="Culture & Work Style">
            <textarea rows={3} value={draft.culture} onChange={(e) => onChange("culture", e.target.value)}
              className="w-full px-4 py-3 bg-[#F4F6FF] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB] resize-none" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "industry", label: "Industry"     },
              { key: "location", label: "Location"     },
              { key: "size",     label: "Team Size"    },
              { key: "founded",  label: "Founded Year" },
            ].map(({ key, label }) => (
              <Field key={key} label={label}>
                <input value={draft[key] ?? ""} onChange={(e) => onChange(key, e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F6FF] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB]" />
              </Field>
            ))}
          </div>

          <Field label={<>Official Website <span className="normal-case font-normal text-slate-400">(optional)</span></>}>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={draft.website ?? ""} onChange={(e) => onChange("website", e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F4F6FF] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB]" />
            </div>
          </Field>

          <Field label="HR / Contact Email">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={draft.email ?? ""} onChange={(e) => onChange("email", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F4F6FF] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB]" />
            </div>
          </Field>

          <Field label="Tagline">
            <input value={draft.tagline ?? ""} onChange={(e) => onChange("tagline", e.target.value)}
              maxLength={100} placeholder="One-line description of your company"
              className="w-full px-4 py-2.5 bg-[#F4F6FF] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3FAB]/20 focus:border-[#1B3FAB]" />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function BusinessCompany() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [draft, setDraft]     = useState(INITIAL_PROFILE);

  const handleChange  = (key, val) => setDraft((p) => ({ ...p, [key]: val }));
  const handleSave    = () => { setProfile(draft); setIsEditing(false); };
  const handleCancel  = () => { setDraft(profile); setIsEditing(false); };

  return isEditing
    ? <EditForm draft={draft} onChange={handleChange} onSave={handleSave} onCancel={handleCancel} />
    : <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />;
}
