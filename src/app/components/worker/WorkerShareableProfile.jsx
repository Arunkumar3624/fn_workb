import {
  BriefcaseBusiness,
  GraduationCap,
  CheckCircle2,
  Clock3,
  Languages,
  MapPin,
  Medal,
  MessageCircle,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { WORKERS } from "../../data/mockData";

// Fallback identity for the standalone public route (/p/priya-sharma) when no
// worker prop is supplied. Every other field below is derived, never fixed.
const DEFAULT_WORKER = WORKERS.find((w) => w.name === "Priya Sharma") ?? WORKERS[0];

const LOCATIONS = ["Bengaluru, India", "Mumbai, India", "Pune, India", "Delhi NCR, India", "Hyderabad, India"];

// Builds the full shareable-profile shape from whatever worker record was
// clicked - this is the single source of truth, so the portal always reflects
// the exact person the business selected instead of a hardcoded identity.
function buildProfile(worker) {
  const w = worker ?? DEFAULT_WORKER;
  const onTimePct = Math.min(99, 80 + Math.round(w.behaviorScore / 50));
  const responseTime = w.behaviorScore >= 750 ? "1 hr" : w.behaviorScore >= 600 ? "3 hrs" : "6 hrs";
  const behaviorLabel = w.behaviorScore >= 750 ? "Excellent" : w.behaviorScore >= 600 ? "Good Standing" : "Building Trust";
  const badge = w.elite ? "Elite Member" : w.verified ? "Verified Pro" : "Rising Talent";
  const firstName = w.name.split(" ")[0];

  return {
    name: w.name,
    initials: w.av,
    title: w.title,
    location: LOCATIONS[w.id % LOCATIONS.length],
    badge,
    behaviorScore: w.behaviorScore,
    behaviorLabel,
    bio: `I specialize in ${w.skills.slice(0, 2).join(" and ")}, with ${w.jobs}+ completed projects on WorkBridge and a ${w.rating} average rating across ${w.reviews} reviews. Clients bring me in when they need dependable delivery, clear communication, and work that holds up under real production use.`,
    stats: [
      { label: "Jobs Completed", value: String(w.jobs) },
      { label: "On-Time Delivery", value: `${onTimePct}%` },
      { label: "Response Time", value: responseTime },
    ],
    skills: w.skills,
    languages: [
      { name: "English", level: "Fluent" },
      { name: "Hindi", level: "Native" },
    ],
    portfolio: w.skills.slice(0, 3).map((skill, i) => ({
      title: `${skill} Project ${i + 1}`,
      tags: [skill, w.title.split(" ")[0]],
    })),
    timeline: [
      {
        type: "Experience",
        icon: BriefcaseBusiness,
        title: w.title,
        place: "Freelance - WorkBridge",
        period: "Active",
        detail: `Completed ${w.jobs} projects with a ${w.rating} rating. Standard rate: ${w.rate}.`,
      },
      {
        type: "Education",
        icon: GraduationCap,
        title: `${w.title} Professional Track`,
        place: "WorkBridge Verified Credential",
        period: "2025",
        detail: `Credential focused on ${w.skills.slice(0, 2).join(" and ")} delivery, client communication, and production handoff standards.`,
      },
    ],
    reviews: [
      {
        name: "Verified Client",
        role: "WorkBridge Business",
        initials: "WB",
        text: `${firstName} delivered exactly what we needed - professional, responsive, and easy to work with from kickoff to handoff.`,
      },
    ],
  };
}

function ProfileSection({ title, children }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <h2 className="text-xl font-bold text-[#0F172A]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SkillPill({ children }) {
  return (
    <span className="rounded-full bg-slate-100 px-3.5 py-2 text-xs font-bold text-[#0F172A] ring-1 ring-slate-200">
      {children}
    </span>
  );
}

function PortfolioThumb({ item }) {
  const initials = item.title
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return item.image ? (
    <div
      className="relative h-44 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.02), rgba(15,23,42,0.34)), url(${item.image})` }}
      aria-label={`${item.title} preview`}
    >
      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0F172A] shadow-sm backdrop-blur">
        Featured work
      </div>
    </div>
  ) : (
    <div className="flex h-44 items-center justify-center bg-[#F1F5F9]">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <BriefcaseBusiness className="h-6 w-6" />
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.18em]">{initials}</span>
      </div>
    </div>
  );
}

function StarRating() {
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" />
      ))}
    </div>
  );
}

function TrustBar({ score, label }) {
  const percentage = Math.min(100, Math.max(0, score / 10));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#0F172A]">Behavior Score: {score} / 1000</p>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          {label}
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        High trust score based on quality, response speed, and on-time delivery.
      </p>
    </div>
  );
}

export default function WorkerShareableProfile({ worker }) {
  const workerProfile = buildProfile(worker);

  return (
    <main className="min-h-full bg-[#F8FAFC] font-sans text-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="relative h-52 rounded-t-xl bg-[radial-gradient(circle_at_18%_30%,rgba(255,107,53,0.26),transparent_28%),linear-gradient(120deg,#0F172A_0%,#334155_52%,#FF6B35_100%)] sm:h-60">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0)_0%,rgba(15,23,42,0.28)_100%)]" />
          </div>
          <div className="px-5 pb-7 sm:px-8">
            <div className="relative z-10 -mt-12 grid gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.14)] lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-32 w-32 flex-none">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-[#1B3FAB] text-3xl font-bold text-white shadow-xl ring-1 ring-slate-200">
                    {workerProfile.initials}
                  </div>
                  <span className="absolute bottom-3 right-3 h-5 w-5 rounded-full border-4 border-white bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.16)]" />
                </div>
                <div className="pb-1">
                  <h1 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
                    {workerProfile.name}
                  </h1>
                  <p className="mt-2 text-lg font-semibold text-slate-700">{workerProfile.title}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {workerProfile.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 font-bold text-[#FF6B35] ring-1 ring-orange-100">
                      <Sparkles className="h-4 w-4" />
                      {workerProfile.badge}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(255,107,53,0.24)] transition hover:-translate-y-0.5 hover:bg-[#e95c25]">
                  <Send className="h-4 w-4" />
                  Hire Me
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF6B35] hover:text-[#FF6B35]">
                  <MessageCircle className="h-4 w-4" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <div className="space-y-8">
            <ProfileSection title="About Me">
              <p className="max-w-4xl text-[15px] leading-7 text-slate-600">{workerProfile.bio}</p>
              <button className="mt-3 text-sm font-bold text-[#FF6B35]">Read more</button>
            </ProfileSection>

            <ProfileSection title="Portfolio & Work">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {workerProfile.portfolio.map((item) => (
                  <article
                    key={item.title}
                    className="group overflow-hidden rounded-xl bg-white shadow-[0_16px_42px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)]"
                  >
                    <PortfolioThumb item={item} />
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#0F172A]">{item.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <SkillPill key={tag}>{tag}</SkillPill>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </ProfileSection>

            <ProfileSection title="Experience & Education">
              <div className="relative space-y-7 before:absolute before:left-5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-200">
                {workerProfile.timeline.map((item) => {
                  const Icon = item.icon;
                  const isEducation = item.type === "Education";
                  return (
                    <article key={`${item.title}-${item.place}`} className="relative flex gap-5">
                      <div className={`relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full ring-8 ring-white ${isEducation ? "bg-blue-50 text-[#1B3FAB]" : "bg-orange-50 text-[#FF6B35]"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 pb-1">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                          {item.type}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-[#0F172A]">{item.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {item.place} - {item.period}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </ProfileSection>

            <ProfileSection title="Client Reviews">
              <div className="grid gap-5 md:grid-cols-2">
                {workerProfile.reviews.map((review) => (
                  <article key={review.name} className="rounded-lg bg-slate-50 p-5 ring-1 ring-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
                        {review.initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#0F172A]">{review.name}</h3>
                        <p className="text-xs font-medium text-slate-500">{review.role}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <StarRating />
                    </div>
                    <p className="mt-4 text-sm italic leading-6 text-slate-500">"{review.text}"</p>
                  </article>
                ))}
              </div>
            </ProfileSection>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Trust Widget</p>
                  <h2 className="mt-1 text-lg font-bold text-[#0F172A]">Verified Reliability</h2>
                </div>
                <Medal className="h-6 w-6 text-amber-500" />
              </div>
              <div className="mt-6">
                <TrustBar score={workerProfile.behaviorScore} label={workerProfile.behaviorLabel} />
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-bold text-[#0F172A]">Quick Stats</h2>
              <div className="mt-5 divide-y divide-slate-100">
                {workerProfile.stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                    <span className="text-sm font-bold text-[#0F172A]">{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Background verified
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-bold text-[#0F172A]">Skills</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {workerProfile.skills.map((skill) => (
                  <SkillPill key={skill}>{skill}</SkillPill>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-[#0F172A]">Languages</h2>
              </div>
              <div className="mt-5 space-y-3">
                {workerProfile.languages.map((language) => (
                  <div key={language.name} className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-slate-600">{language.name}</span>
                    <span className="font-bold text-slate-900">{language.level}</span>
                  </div>
                ))}
              </div>
            </section>

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
  );
}

