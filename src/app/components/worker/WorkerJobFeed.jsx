import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  IndianRupee,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { calculatePotentialPoints } from "../../utils/pointMatrix";
import JobApplicationDrawer from "./JobApplicationDrawer";

// Extracts the numeric rupee value out of strings like "Rs 15,000" so the
// Dynamic Point Matrix can run against real budget data.
function parseBudget(budgetString) {
  return Number(String(budgetString).replace(/[^0-9]/g, "")) || 0;
}

const JOBS = [
  {
    id: "job-1",
    title: "React Dashboard Build",
    company: "FinEdge India",
    location: "Remote - India",
    budget: "Rs 15,000",
    duration: "2 weeks",
    type: "Fixed Price",
    posted: "2h ago",
    category: "Frontend",
    rating: 4.9,
    verified: true,
    tags: ["React", "Recharts", "Tailwind", "API Integration"],
    summary:
      "Build a clean analytics dashboard for a fintech team with charts, filtered tables, and responsive states.",
    overview:
      "FinEdge India needs a production-ready React dashboard for its internal fintech operations team. The dashboard will help operators track revenue movement, customer funnel health, risk alerts, and downloadable reporting without jumping across multiple tools.",
    deliverables: [
      "Build reusable KPI cards with loading, empty, and warning states.",
      "Create a six-month revenue and activity chart using a reliable charting library.",
      "Implement a filtered transactions table with clear mobile and tablet behavior.",
      "Connect the UI to existing sample API responses and keep the data layer easy to replace.",
    ],
    techStack: ["React", "Tailwind CSS", "Recharts", "REST APIs", "Vite"],
  },
  {
    id: "job-2",
    title: "SaaS Pricing Page Refresh",
    company: "Nova Studio",
    location: "Remote",
    budget: "Rs 48,000",
    duration: "3 weeks",
    type: "Milestone",
    posted: "1d ago",
    category: "UI Design",
    rating: 4.8,
    verified: true,
    tags: ["Figma", "Responsive UI", "SaaS", "Copywriting"],
    summary:
      "Refresh a premium SaaS pricing page with stronger hierarchy, better comparison blocks, and conversion-focused copy.",
    overview:
      "Nova Studio is preparing a pricing page refresh for a growth-stage B2B SaaS product. The current page contains the right information, but buyers struggle to compare plans quickly and the trust signals are too scattered.",
    deliverables: [
      "Redesign the pricing hierarchy for faster plan comparison.",
      "Create clean tier cards with feature grouping, support details, and FAQ coverage.",
      "Improve page copy for clarity, trust, and enterprise-grade confidence.",
      "Deliver responsive React and Tailwind implementation for desktop, tablet, and mobile.",
    ],
    techStack: ["Figma", "React", "Tailwind CSS", "UX Writing", "A/B Testing"],
  },
  {
    id: "job-3",
    title: "Node API Cleanup",
    company: "OpsPilot",
    location: "Remote - IST overlap",
    budget: "Rs 22,000",
    duration: "10 days",
    type: "Fixed Price",
    posted: "4h ago",
    category: "Backend",
    rating: 4.7,
    verified: false,
    tags: ["Node.js", "Express", "PostgreSQL", "Testing"],
    summary:
      "Refactor a small Express API, standardize error handling, and add missing validation around key endpoints.",
    overview:
      "OpsPilot has a working Node and Express API that powers a lightweight operations product. The product is stable, but the API has grown unevenly and now needs a focused cleanup pass before the next release.",
    deliverables: [
      "Audit route handlers and identify duplication or unclear boundaries.",
      "Standardize error responses across high-traffic endpoints.",
      "Add input validation around sensitive create and update flows.",
      "Write focused tests for the highest-risk API paths.",
    ],
    techStack: ["Node.js", "Express", "PostgreSQL", "Zod", "Jest"],
  },
  {
    id: "job-4",
    title: "E-Commerce Product Cards",
    company: "Nourish Co.",
    location: "Remote",
    budget: "Rs 18,500",
    duration: "1 week",
    type: "Fixed Price",
    posted: "8h ago",
    category: "Frontend",
    rating: 4.6,
    verified: true,
    tags: ["React", "Product UI", "Accessibility", "CSS Grid"],
    summary:
      "Create accessible, responsive product listing cards with variant states, badges, and polished hover behavior.",
    overview:
      "Nourish Co. is rebuilding its product listing page and needs a focused frontend implementation for product cards. The cards must support sale states, ratings, stock warnings, and quick actions without layout instability.",
    deliverables: [
      "Build a reusable product card component with clear prop-driven variants.",
      "Create a responsive listing grid using stable CSS grid constraints.",
      "Handle sale, out-of-stock, loading, and long-title states.",
      "Add accessible button, focus, and hover behavior.",
    ],
    techStack: ["React", "Tailwind CSS", "CSS Grid", "ARIA", "Story States"],
  },
  {
    id: "job-5",
    title: "Landing Page QA Pass",
    company: "Lumen Labs",
    location: "Remote",
    budget: "Rs 12,000",
    duration: "3 days",
    type: "Hourly",
    posted: "12h ago",
    category: "QA",
    rating: 4.8,
    verified: true,
    urgent: true,
    tags: ["Responsive QA", "Chrome DevTools", "UX Notes", "Bug Reports"],
    summary:
      "Run a detailed QA pass on a new product landing page and document responsive, copy, and interaction issues.",
    overview:
      "Lumen Labs is preparing to launch a new AI analytics landing page and wants a careful QA pass before publishing. The team needs clear, prioritized feedback rather than generic notes.",
    deliverables: [
      "Test desktop, tablet, and mobile breakpoints.",
      "Review hover, focus, form, and navigation behavior.",
      "Identify copy, spacing, layout, and trust-signal issues.",
      "Provide screenshots and severity labels for each finding.",
    ],
    techStack: ["Chrome DevTools", "Responsive QA", "Bug Reports", "UX Review", "Launch QA"],
  },
  {
    id: "job-6",
    title: "AI Workflow Builder UX",
    company: "ShiftWorks",
    location: "Remote - Global",
    budget: "Rs 42,000",
    duration: "2.5 weeks",
    type: "Milestone",
    posted: "5h ago",
    category: "Product UX",
    rating: 5.0,
    verified: true,
    tags: ["Workflow UX", "AI", "Figma", "Interaction Design"],
    summary:
      "Design a workflow builder interface for internal AI automations with clear steps, states, and handoff notes.",
    overview:
      "ShiftWorks is creating an internal AI automation tool for operations teams. The core challenge is making workflow creation, AI action configuration, previewing, and monitoring feel calm and explainable.",
    deliverables: [
      "Map the end-to-end workflow creation experience.",
      "Create wireframes for triggers, AI actions, preview states, and run history.",
      "Design high-fidelity screens for the builder and monitoring view.",
      "Define important empty, error, success, and review states.",
    ],
    techStack: ["Figma", "Workflow UX", "AI Actions", "Interaction States", "Handoff"],
  },
];

const FILTERS = ["All", "Frontend", "UI Design", "Backend", "QA", "Product UX"];

const QUIZ = [
  {
    step: "q1",
    eyebrow: "Question 1 of 3",
    title: "React Hooks",
    prompt:
      "Which approach is best when a component needs local UI state and must synchronize data after rendering?",
    options: [
      "Call useEffect inside a click handler only when the request starts.",
      "Use useState for local UI state and useEffect for synchronized side effects.",
      "Update state directly during render so the UI always has fresh values.",
    ],
    answer: "Use useState for local UI state and useEffect for synchronized side effects.",
  },
  {
    step: "q2",
    eyebrow: "Question 2 of 3",
    title: "Component Architecture",
    prompt:
      "A dashboard card will be reused across several job views. What is the strongest implementation choice?",
    options: [
      "Create a reusable component with props for title, metric, state, and action.",
      "Copy the same JSX into each page so every screen is independent.",
      "Keep all dashboard cards in one parent component and hide unused cards with CSS.",
    ],
    answer: "Create a reusable component with props for title, metric, state, and action.",
  },
  {
    step: "q3",
    eyebrow: "Question 3 of 3",
    title: "Async UI States",
    prompt:
      "What should a production dashboard show while an API request is still loading?",
    options: [
      "A stable loading state that preserves layout and prevents content jumping.",
      "A blank white area until the request finishes.",
      "A browser alert telling the user to wait.",
    ],
    answer: "A stable loading state that preserves layout and prevents content jumping.",
  },
];

const QUIZ_ORDER = ["q1", "q2", "q3"];

function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[70] rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-bold text-emerald-700 shadow-2xl">
      <span className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5" />
        {message}
      </span>
    </div>
  );
}

export default function WorkerJobFeed() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [quizStep, setQuizStep] = useState("idle");
  const [selectedOption, setSelectedOption] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(847);
  const [submittedJobs, setSubmittedJobs] = useState([]);
  const [toast, setToast] = useState("");
  // Fast-path apply drawer â€” independent of selectedJob/isPortalOpen so it can
  // open straight from a job card without also revealing the full detail portal.
  const [applyJob, setApplyJob] = useState(null);

  const filteredJobs = useMemo(() => {
    return JOBS.filter((job) => {
      const searchable = [job.title, job.company, job.category, ...job.tags].join(" ").toLowerCase();
      const matchesQuery = query.trim().length === 0 || searchable.includes(query.toLowerCase());
      const matchesFilter = filter === "All" || job.category === filter;

      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);

  const currentQuestion = QUIZ.find((question) => question.step === quizStep);
  const isPortalOpen = Boolean(selectedJob);
  const isSubmitted = selectedJob ? submittedJobs.includes(selectedJob.id) : false;

  useEffect(() => {
    if (!isPortalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPortalOpen]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const resetPortalState = () => {
    setSelectedJob(null);
    setQuizStep("idle");
    setSelectedOption("");
    setQuizAnswers({});
    setIsConfirmOpen(false);
  };

  const openJob = (job) => {
    setSelectedJob(job);
    setQuizStep("idle");
    setSelectedOption("");
    setQuizAnswers({});
    setIsConfirmOpen(false);
  };

  const startQuiz = () => {
    setQuizStep("q1");
    setSelectedOption("");
    setQuizAnswers({});
  };

  const advanceQuiz = () => {
    if (!selectedOption || !currentQuestion) return;

    const nextAnswers = {
      ...quizAnswers,
      [quizStep]: selectedOption,
    };

    setQuizAnswers(nextAnswers);

    const currentIndex = QUIZ_ORDER.indexOf(quizStep);
    const nextStep = QUIZ_ORDER[currentIndex + 1];

    if (nextStep) {
      setQuizStep(nextStep);
      setSelectedOption(nextAnswers[nextStep] || "");
      return;
    }

    setQuizStep("celebration");
    setSelectedOption("");

    // Real confetti for the reward moment
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const colors = ["#10B981", "#34D399", "#FF6B35", "#FBBF24", "#FFFFFF"];
      confetti({ particleCount: 130, spread: 85, startVelocity: 42, origin: { y: 0.55 }, colors, zIndex: 90 });
      window.setTimeout(() => {
        confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.75 }, colors, zIndex: 90 });
        confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.75 }, colors, zIndex: 90 });
      }, 300);
    }
  };

  const submitFreeProposal = () => {
    if (!selectedJob || isSubmitted) return;

    setSubmittedJobs((current) => [...new Set([...current, selectedJob.id])]);
    setUserPoints((points) => points + 15);
    resetPortalState();
    showToast("Proposal submitted. You earned +15 PTS.");
  };

  const confirmDirectApply = () => {
    if (!selectedJob) return;

    setSubmittedJobs((current) => [...new Set([...current, selectedJob.id])]);
    setUserPoints((points) => Math.max(0, points - 5));
    resetPortalState();
    showToast("Proposal submitted. 5 PTS deducted.");
  };

  // â”€â”€ Fast-path apply drawer handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openApplyDrawer = (job) => setApplyJob(job);
  const closeApplyDrawer = () => setApplyJob(null);

  // Drawer â†’ Quiz: hand off to the existing quiz portal for this job
  const drawerChooseQuiz = () => {
    if (!applyJob) return;
    setSelectedJob(applyJob);
    setQuizStep("q1");
    setSelectedOption("");
    setQuizAnswers({});
    setIsConfirmOpen(false);
    setApplyJob(null);
  };

  // Drawer â†’ Direct Apply: hand off to the existing skip-quiz confirm dialog
  const drawerChooseDirect = () => {
    if (!applyJob) return;
    setSelectedJob(applyJob);
    setQuizStep("idle");
    setIsConfirmOpen(true);
    setApplyJob(null);
  };

  return (
    <div
      className={`relative z-0 h-full min-h-screen overflow-x-hidden bg-gradient-to-br from-[#dbe4ff] via-[#eef1ff] to-[#ffe4d2] pb-32 text-slate-900 ${
        isPortalOpen ? "overflow-y-hidden" : "overflow-y-auto"
      }`}
    >
      <div className="pointer-events-none fixed -top-24 -left-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#1B3FAB]/30 blur-[110px]" />
      <div className="pointer-events-none fixed top-56 -right-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#FF6B35]/30 blur-[110px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 -z-10 h-96 w-96 rounded-full bg-purple-400/20 blur-[110px]" />
      <section className="relative mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                WorkBridge Job Feed
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Premium freelance opportunities
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Browse verified briefs, choose a smarter apply path, and earn points when you prove fit through assessments.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-[#FF6B35]">
              {userPoints} PTS available
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, company, skill, or category"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#1B3FAB] focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setFilter("All");
                setQuery("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <Filter className="h-4 w-4" />
              Reset
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 ${
                  filter === item
                    ? "border-[#1B3FAB] bg-[#1B3FAB] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {filteredJobs.map((job) => {
            const alreadySubmitted = submittedJobs.includes(job.id);
            const potentialPoints = calculatePotentialPoints(parseBudget(job.budget), Boolean(job.urgent));

            return (
              <article
                key={job.id}
                className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 shadow-lg shadow-slate-200/40 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      {job.category}
                    </p>
                    <h2 className="mt-3 text-lg font-black leading-snug text-slate-900">{job.title}</h2>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    {job.verified && (
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                    )}
                    <span
                      className={`flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700 ${
                        job.urgent ? "animate-pulse" : ""
                      }`}
                    >
                      <Trophy size={14} />
                      Up to {potentialPoints} Pts
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {job.company}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.summary}</p>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/20 bg-white/40 backdrop-blur-md p-3 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Budget</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{job.budget}</p>
                  </div>
                  <div className="border-x border-slate-200">
                    <p className="text-xs text-slate-500">Type</p>
                    <p className="mt-1 text-sm font-black text-slate-900">{job.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Rating</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm font-black text-slate-900">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {job.rating}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {job.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/60 bg-white/50 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {job.posted}
                  </span>
                  {alreadySubmitted && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Submitted
                    </span>
                  )}
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openJob(job)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-all duration-300 hover:bg-slate-200"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    disabled={alreadySubmitted}
                    onClick={() => openApplyDrawer(job)}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold shadow-md transition-all duration-300 ${
                      alreadySubmitted
                        ? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
                        : "bg-[#FF6B35] text-white shadow-orange-200 hover:-translate-y-0.5 hover:bg-[#e95c25] hover:shadow-lg"
                    }`}
                  >
                    {alreadySubmitted ? "Submitted" : "Apply Now"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {isPortalOpen && selectedJob && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close job portal backdrop"
            onClick={resetPortalState}
            className="absolute inset-0 bg-slate-900/60 opacity-100 backdrop-blur-md transition-opacity duration-300"
          />

          <section className="relative z-50 flex h-[92vh] w-[96vw] max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-[#dbe4ff] via-[#eef1ff] to-[#ffe4d2] shadow-[0_32px_90px_rgba(15,23,42,0.35)] transition-transform duration-300 ease-out">
            <header className="relative flex flex-shrink-0 items-start justify-between gap-5 overflow-hidden border-b border-slate-200 bg-slate-950 p-6 text-white sm:p-7">
              <div className="pointer-events-none absolute right-[-90px] top-[-120px] h-72 w-72 rounded-full bg-[#FF6B35]/30 blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-120px] left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="relative min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">
                  {quizStep === "idle" ? "Verified Job Brief" : quizStep === "celebration" ? "Reward Unlocked" : "Skill Assessment"}
                </p>
                <h2 className="mt-2 max-w-3xl text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                  {quizStep === "idle"
                    ? selectedJob.title
                    : quizStep === "celebration"
                    ? "Assessment Passed"
                    : `${currentQuestion.eyebrow}: ${currentQuestion.title}`}
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-200">
                  <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">{selectedJob.company}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">{selectedJob.category}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {selectedJob.rating}
                  </span>
                  {selectedJob.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1.5 text-emerald-200 ring-1 ring-emerald-300/25">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified client
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={resetPortalState}
                className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-all duration-300 hover:bg-white/20"
                aria-label="Close job portal"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 lg:p-8">
              {quizStep === "idle" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <main className="flex flex-col gap-6 lg:col-span-8">
                    <section className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1B3FAB] ring-1 ring-blue-100">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Project context</p>
                          <h3 className="text-lg font-black text-slate-900">Role Overview</h3>
                        </div>
                      </div>
                      <p className="mt-5 text-[15px] leading-7 text-slate-600">{selectedJob.overview}</p>
                    </section>

                    <section className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">What success means</p>
                          <h3 className="text-lg font-black text-slate-900">Key Deliverables</h3>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {selectedJob.deliverables.map((item) => (
                          <div key={item} className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-sm">
                            <div className="flex gap-3 text-sm leading-relaxed text-slate-600">
                              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                              <span>{item}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-100">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Required stack</p>
                          <h3 className="text-lg font-black text-slate-900">Skills Matched to Brief</h3>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {selectedJob.techStack.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/60 bg-white/50 backdrop-blur-sm px-4 py-2 text-xs font-bold text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </section>
                  </main>

                  <aside className="self-start lg:sticky lg:top-0 lg:col-span-4">
                    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-lg shadow-slate-200/40">
                      <div className="border-b border-white/50 bg-white/20 p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Apply strategy</p>
                            <h3 className="mt-1 text-xl font-black text-slate-900">Choose your path</h3>
                          </div>
                          <span className="flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
                            <Trophy size={12} />
                            {calculatePotentialPoints(parseBudget(selectedJob.budget), Boolean(selectedJob.urgent))} PTS
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          Your balance: <span className="text-slate-900">{userPoints} PTS</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-1">
                        <div className="flex items-center gap-3 rounded-2xl bg-white/40 backdrop-blur-md p-4 ring-1 ring-white/50">
                          <IndianRupee className="h-5 w-5 text-[#1B3FAB]" />
                          <div>
                            <p className="text-xs font-semibold text-slate-500">Budget</p>
                            <p className="text-sm font-black text-slate-900">{selectedJob.budget}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-white/40 backdrop-blur-md p-4 ring-1 ring-white/50">
                          <Timer className="h-5 w-5 text-[#1B3FAB]" />
                          <div>
                            <p className="text-xs font-semibold text-slate-500">Duration</p>
                            <p className="text-sm font-black text-slate-900">{selectedJob.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-white/40 backdrop-blur-md p-4 ring-1 ring-white/50">
                          <MapPin className="h-5 w-5 text-[#1B3FAB]" />
                          <div>
                            <p className="text-xs font-semibold text-slate-500">Location</p>
                            <p className="text-sm font-black text-slate-900">{selectedJob.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 p-5">
                        <button
                          type="button"
                          disabled={isSubmitted}
                          onClick={startQuiz}
                          className={`w-full rounded-2xl px-5 py-4 text-sm font-black shadow-lg transition-all duration-300 ${
                            isSubmitted
                              ? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
                              : "bg-[#FF6B35] text-white shadow-orange-200 hover:-translate-y-0.5 hover:bg-[#e95c25] hover:shadow-xl"
                          }`}
                        >
                          Take Quiz +15 PTS
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitted || userPoints < 5}
                          onClick={() => setIsConfirmOpen(true)}
                          className={`mt-3 w-full rounded-2xl border px-5 py-4 text-sm font-black transition-all duration-300 ${
                            isSubmitted || userPoints < 5
                              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                              : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:shadow-md"
                          }`}
                        >
                          Direct Apply - 5 PTS
                        </button>
                      </div>
                    </div>
                  </aside>
                </div>
              )}

              {currentQuestion && (
                <div className="mx-auto max-w-3xl transition-opacity duration-300">
                  <div className="rounded-xl border border-white/70 bg-white/60 backdrop-blur-xl p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                          {currentQuestion.eyebrow}
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-slate-900">{currentQuestion.title}</h3>
                      </div>
                      <span className="rounded-full bg-white/50 backdrop-blur-sm px-4 py-2 text-xs font-black text-slate-500 ring-1 ring-white/60">
                        {QUIZ_ORDER.indexOf(quizStep) + 1} / {QUIZ_ORDER.length}
                      </span>
                    </div>
                    <p className="mt-5 text-base leading-7 text-slate-600">{currentQuestion.prompt}</p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedOption === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSelectedOption(option)}
                          className={`w-full rounded-2xl border p-5 text-left text-sm font-semibold leading-6 transition-all duration-300 ${
                            isSelected
                              ? "border-slate-800 bg-white/60 backdrop-blur-md text-slate-900 ring-2 ring-slate-800"
                              : "border-white/60 bg-white/40 backdrop-blur-md text-slate-700 hover:border-white/80 hover:bg-white/60"
                          }`}
                        >
                          <span className="flex items-start gap-4">
                            <span
                              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-black ${
                                isSelected
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-300 bg-white text-slate-500"
                              }`}
                            >
                              {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {quizStep === "celebration" && (
                <div className="relative flex h-full flex-col items-center justify-center overflow-hidden">
                  <div className="absolute left-16 top-16 h-3 w-3 rounded-full bg-emerald-300 opacity-80" />
                  <div className="absolute right-24 top-28 h-2 w-2 rounded-full bg-orange-300 opacity-80" />
                  <div className="absolute bottom-24 left-28 h-2.5 w-2.5 rounded-full bg-blue-300 opacity-80" />
                  <div className="absolute bottom-16 right-20 h-3 w-3 rounded-full bg-emerald-400 opacity-80" />

                  <div className="w-full max-w-3xl rounded-3xl border border-emerald-200/60 bg-white/60 backdrop-blur-xl p-10 text-center shadow-[0_0_60px_-15px_rgba(34,197,94,0.5)]">
                    <div className="mx-auto flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_60px_-15px_rgba(34,197,94,0.7)]">
                      <Check className="h-12 w-12" />
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-2 text-emerald-700">
                      <Award className="h-5 w-5" />
                      <span className="text-sm font-black uppercase tracking-[0.2em]">Reward Unlocked</span>
                    </div>
                    <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
                      Assessment Passed! ðŸŽ‰ You Earned +15 Points!
                    </h3>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
                      You proved fit for {selectedJob.title}. Your proposal can now be submitted for free, and your WorkBridge score gets a reward boost.
                    </p>
                    <button
                      type="button"
                      disabled={isSubmitted}
                      onClick={submitFreeProposal}
                      className={`mt-8 w-full rounded-2xl px-8 py-4 text-base font-black transition-all duration-300 ${
                        isSubmitted
                          ? "cursor-not-allowed bg-slate-200 text-slate-400"
                          : "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl"
                      }`}
                    >
                      {isSubmitted ? "Proposal Submitted" : "Submit Proposal (FREE)"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {currentQuestion && (
              <footer className="flex flex-shrink-0 justify-end border-t border-white/60 bg-white/40 backdrop-blur-xl px-7 py-5">
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={advanceQuiz}
                  className={`rounded-2xl px-8 py-3.5 text-sm font-black transition-all duration-300 ${
                    selectedOption
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:-translate-y-0.5 hover:shadow-xl"
                      : "cursor-not-allowed bg-slate-200 text-slate-400"
                  }`}
                >
                  {quizStep === "q3" ? "Finish Assessment" : "Next Question"}
                </button>
              </footer>
            )}
          </section>
        </div>
      )}

      {isConfirmOpen && selectedJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative z-[70] w-full max-w-sm rounded-2xl border border-white/70 bg-white/70 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300">
            <h3 className="text-center text-xl font-black text-slate-900">Skip Skill Assessment?</h3>
            <p className="mt-3 text-center text-sm leading-6 text-slate-500">
              You are skipping the vetting process. This will deduct 5 points. Proceed?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all duration-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDirectApply}
                className="flex-1 rounded-2xl bg-[#FF6B35] px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <JobApplicationDrawer
        open={Boolean(applyJob)}
        job={applyJob}
        potentialPoints={applyJob ? calculatePotentialPoints(parseBudget(applyJob.budget), Boolean(applyJob.urgent)) : 0}
        onClose={closeApplyDrawer}
        onChooseQuiz={drawerChooseQuiz}
        onChooseDirect={drawerChooseDirect}
      />

      <Toast message={toast} />
    </div>
  );
}
