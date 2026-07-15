import { createContext, useContext, useState } from "react";
import { WORKERS } from "../data/mockData";
import { calculateEarnings, makeTimelineEvent } from "../utils/projectStatus";

const PlatformContext = createContext(null);

const INITIAL_MESSAGES = [
  {
    id: "msg-1",
    threadId: "task-1",
    senderId: "client-finedge",
    receiverId: "worker-priya",
    text: "Please make the portfolio chart interactive with hover tooltips.",
    timestamp: "2026-07-02T10:24:00+05:30",
    isRead: true,
  },
  {
    id: "msg-2",
    threadId: "task-1",
    senderId: "worker-priya",
    receiverId: "client-finedge",
    text: "Done! Uploading the updated build now.",
    timestamp: "2026-07-02T10:31:00+05:30",
    isRead: true,
  },
  {
    id: "msg-3",
    threadId: "task-1",
    senderId: "client-finedge",
    receiverId: "worker-priya",
    text: "Looks great. Awaiting final files before we release payment.",
    timestamp: "2026-07-02T10:35:00+05:30",
    isRead: false,
  },
  {
    id: "msg-4",
    threadId: "task-2",
    senderId: "client-growthpilot",
    receiverId: "worker-priya",
    text: "All 20 articles look excellent! Reviewing for final approval.",
    timestamp: "2026-07-02T09:00:00+05:30",
    isRead: true,
  },
  {
    id: "msg-5",
    threadId: "task-2",
    senderId: "worker-priya",
    receiverId: "client-growthpilot",
    text: "Thank you! Let me know if any final edits are needed.",
    timestamp: "2026-07-02T09:10:00+05:30",
    isRead: true,
  },
  {
    id: "msg-6",
    threadId: "task-2",
    senderId: "client-growthpilot",
    receiverId: "worker-priya",
    text: "Everything approved. Releasing payment shortly!",
    timestamp: "2026-07-02T09:45:00+05:30",
    isRead: false,
  },
  {
    id: "msg-7",
    threadId: "task-3",
    senderId: "client-nourish",
    receiverId: "worker-priya",
    text: "Can we do a quick call to align on the color direction?",
    timestamp: "2026-07-01T16:00:00+05:30",
    isRead: true,
  },
  {
    id: "msg-8",
    threadId: "task-3",
    senderId: "worker-priya",
    receiverId: "client-nourish",
    text: "Absolutely! 3 PM tomorrow works perfectly for me.",
    timestamp: "2026-07-01T16:15:00+05:30",
    isRead: true,
  },
  {
    id: "msg-9",
    threadId: "task-3",
    senderId: "client-nourish",
    receiverId: "worker-priya",
    text: "Perfect, talk then! Super excited about this project.",
    timestamp: "2026-07-02T10:00:00+05:30",
    isRead: false,
  },
];

// Job invitations awaiting the worker's Acceptance Gate. Shared via context so
// the sidebar's pending badge and the Negotiations inbox stay in sync.
const INITIAL_INVITES = [
  {
    id: "technova",
    businessName: "TechNova Solutions",
    businessInitials: "TN",
    businessBg: "bg-[#1B3FAB]",
    businessRating: 4.9,
    businessJobsPosted: 24,
    jobTitle: "Inventory Dashboard Build",
    budget: "₹22,000",
    duration: "2 weeks",
    deadline: "Jul 28, 2026",
    location: "Remote - India",
    description:
      "We need a React + Node dashboard to track live warehouse inventory across 3 locations, with low-stock alerts and a CSV export for our ops team. Clean handoff docs expected at the end.",
    deliverables: [
      "Build a live inventory table with per-location stock levels.",
      "Add low-stock alert badges with a configurable threshold.",
      "Implement CSV export for the ops team's weekly reporting.",
      "Deliver documented handoff notes and a short Loom walkthrough.",
    ],
    techStack: ["React", "Node.js", "PostgreSQL", "REST API"],
    isAccepted: false,
    projectStatus: null,
    timelineEvents: [],
    messages: [],
  },
  {
    id: "brightideas",
    businessName: "Bright Ideas Co.",
    businessInitials: "BI",
    businessBg: "bg-[#FF6B2C]",
    businessRating: 4.7,
    businessJobsPosted: 11,
    jobTitle: "Instagram Content Calendar",
    budget: "₹9,500",
    duration: "1 week",
    deadline: "Jul 18, 2026",
    location: "Remote",
    description:
      "Looking for a content designer to plan and design a full month of Instagram posts — grid consistency, story templates, and captions included. Brand kit will be shared once you're in.",
    deliverables: [
      "Design a full month (30 posts) of Instagram grid content.",
      "Create 5 reusable Story templates matching the brand kit.",
      "Write on-brand captions and hashtag sets for every post.",
      "Deliver a content calendar with suggested posting times.",
    ],
    techStack: ["Figma", "Canva", "Instagram", "Brand Design"],
    isAccepted: false,
    projectStatus: null,
    timelineEvents: [],
    messages: [],
  },
  {
    id: "growthpilot",
    businessName: "GrowthPilot",
    businessInitials: "GP",
    businessBg: "bg-emerald-600",
    businessRating: 4.8,
    businessJobsPosted: 37,
    jobTitle: "SEO Content Sprint",
    budget: "₹14,000",
    duration: "3 weeks",
    deadline: "Aug 1, 2026",
    location: "Remote",
    description:
      "20 long-form SEO articles targeting mid-competition B2B SaaS keywords. Copyscape-clean, 80+ Yoast score required. Flexible on delivery pacing across 3 weeks.",
    deliverables: [
      "Write 20 long-form articles (1,500–2,000 words each).",
      "Hit 80+ Yoast SEO score and pass Copyscape on every piece.",
      "Target the provided mid-competition B2B SaaS keyword list.",
      "Deliver in weekly batches of 6-7 articles for review.",
    ],
    techStack: ["SEO Writing", "Keyword Research", "WordPress"],
    isAccepted: false,
    projectStatus: null,
    timelineEvents: [],
    messages: [],
  },
  {
    id: "quickcart",
    businessName: "QuickCart Retail",
    businessInitials: "QC",
    businessBg: "bg-[#1B3FAB]",
    businessRating: 4.6,
    businessJobsPosted: 19,
    jobTitle: "Product Photography Retouch",
    budget: "₹6,200",
    duration: "5 days",
    deadline: "Jul 15, 2026",
    location: "Remote",
    description:
      "Batch retouching for ~150 product photos — background cleanup, color correction, and consistent shadow treatment for the catalog relaunch.",
    deliverables: [
      "Retouch ~150 product photos with clean background removal.",
      "Apply consistent color correction across the full batch.",
      "Add a uniform soft-shadow treatment for the catalog style.",
      "Deliver web-optimized and print-resolution export sets.",
    ],
    techStack: ["Photoshop", "Lightroom", "Batch Editing"],
    isAccepted: true,
    projectStatus: "FUNDS_SECURED",
    timelineEvents: [makeTimelineEvent("FUNDS_SECURED")],
    messages: [
      { id: 1, from: "business", text: "Thanks for accepting! Uploading the raw photo batch now.", time: "Yesterday, 4:40 PM" },
      { id: 2, from: "worker", text: "Great, I'll take a first look tonight and confirm the turnaround.", time: "Yesterday, 4:48 PM" },
      { id: 3, from: "business", text: "Perfect, no rush — end of week works fine.", time: "Yesterday, 4:50 PM" },
    ],
  },
];

// Business Inbox thread data — lives in context (not local component state)
// so the Project Lifecycle FSM can write projectStatus into both this and
// invitesDb from wherever a transition is triggered.
// "active" threads = hired workers on live projects · "qa" = pre-hire Q&A
const INITIAL_BUSINESS_THREADS = [
  {
    id: "priya",
    workerName: "Priya Sharma",
    workerInitials: "PS",
    workerBg: "bg-[#1B3FAB]",
    workerRole: "Full-Stack Developer",
    projectName: "E-Commerce Platform Dev",
    type: "active",
    unread: 2,
    budget: 42000,
    deadline: "Jul 20, 2026",
    projectStatus: "WORK_IN_PROGRESS",
    timelineEvents: [makeTimelineEvent("FUNDS_SECURED"), makeTimelineEvent("WORK_IN_PROGRESS")],
    messages: [
      {
        id: 1,
        from: "worker",
        text: "Hi! Just kicked off milestone 2. Cart and payment flow are looking clean — pushing first build by end of day.",
        time: "Jun 30, 9:15 AM",
      },
      {
        id: 2,
        from: "business",
        text: "Great start! Make sure the filters on the transactions table work on mobile — our clients mostly use phones.",
        time: "Jun 30, 9:42 AM",
      },
      {
        id: 3,
        from: "worker",
        text: "Already handled that. Quick question — for the product recommendations engine in milestone 3, rule-based or ML model?",
        time: "Jun 30, 10:05 AM",
      },
      {
        id: 4,
        from: "business",
        text: "Let's go rule-based for now. Keep it simple — we can upgrade post-launch.",
        time: "Jun 30, 10:18 AM",
      },
      {
        id: 5,
        from: "worker",
        text: "Perfect. I've uploaded milestone 2 files — all 4 screens with full responsiveness. Please review and approve when ready!",
        time: "Today, 10:35 AM",
      },
    ],
  },
  {
    id: "arjun",
    workerName: "Arjun Mehta",
    workerInitials: "AM",
    workerBg: "bg-[#1B3FAB]",
    workerRole: "UI/UX Designer",
    projectName: "Brand Identity Design",
    type: "active",
    unread: 0,
    budget: 16500,
    deadline: "Jul 8, 2026",
    projectStatus: "FILES_SUBMITTED",
    timelineEvents: [makeTimelineEvent("FUNDS_SECURED"), makeTimelineEvent("WORK_IN_PROGRESS"), makeTimelineEvent("FILES_SUBMITTED")],
    messages: [
      {
        id: 1,
        from: "worker",
        text: "Brand guideline PDF is uploaded — covers logo variants, color system, type scale, and don't-use rules. All 4 milestones done!",
        time: "Jul 1, 3:00 PM",
      },
      {
        id: 2,
        from: "business",
        text: "Excellent work, Arjun! The icon system is exactly what we imagined. Reviewing everything now.",
        time: "Jul 1, 4:30 PM",
      },
      {
        id: 3,
        from: "worker",
        text: "Thank you! Happy to record a Loom walkthrough of the token system if your dev team needs it.",
        time: "Jul 1, 4:45 PM",
      },
      {
        id: 4,
        from: "business",
        text: "That would be fantastic — please go ahead. We'll share with the team.",
        time: "Jul 1, 5:10 PM",
      },
    ],
  },
  {
    id: "rohit",
    workerName: "Rohit Verma",
    workerInitials: "RV",
    workerBg: "bg-emerald-600",
    workerRole: "Content & SEO Specialist",
    projectName: "SEO Content – 20 Articles",
    type: "active",
    unread: 1,
    budget: 19000,
    deadline: "Jul 25, 2026",
    projectStatus: "WORK_IN_PROGRESS",
    timelineEvents: [makeTimelineEvent("FUNDS_SECURED"), makeTimelineEvent("WORK_IN_PROGRESS")],
    messages: [
      {
        id: 1,
        from: "worker",
        text: "Milestone 1 done — first 7 articles submitted. All pass Copyscape and score 82+ on Yoast.",
        time: "Jul 2, 8:30 AM",
      },
      {
        id: 2,
        from: "business",
        text: "Solid work! We'll review and approve today. Go ahead and start on articles 8–14.",
        time: "Jul 2, 9:00 AM",
      },
      {
        id: 3,
        from: "worker",
        text: "On it! Quick question — for the SaaS articles, should I target informational keywords or lean more transactional for articles 8–14?",
        time: "Today, 11:20 AM",
      },
    ],
  },
  // Pre-hire Q&A threads — no project exists yet, so no projectStatus until
  // "Accept Proposal & Secure Funds" clears the Invoice page.
  {
    id: "sneha",
    workerName: "Sneha Patil",
    workerInitials: "SP",
    workerBg: "bg-[#FF6B2C]",
    workerRole: "UI/UX Designer",
    bid: "₹9,800",
    budget: 9800,
    projectName: "AI Chatbot (Applied)",
    type: "qa",
    rating: 4.7,
    reviews: 54,
    unread: 1,
    projectStatus: null,
    timelineEvents: [],
    messages: [
      {
        id: 1,
        from: "worker",
        text: "Can you share the brand kit (fonts, colors, logo files)? And is the design Figma-first or should I deliver code-ready components?",
        time: "4 hours ago",
      },
    ],
  },
  {
    id: "ravi",
    workerName: "Ravi Kumar",
    workerInitials: "RK",
    workerBg: "bg-emerald-600",
    workerRole: "Data Analyst",
    bid: "₹6,200",
    budget: 6200,
    projectName: "AI Chatbot (Applied)",
    type: "qa",
    rating: 4.6,
    reviews: 31,
    unread: 1,
    projectStatus: null,
    timelineEvents: [],
    messages: [
      {
        id: 1,
        from: "worker",
        text: "Which BI tool is preferred — Power BI or Tableau? And will I get direct DB access or export CSV snapshots?",
        time: "6 hours ago",
      },
    ],
  },
  {
    id: "divya",
    workerName: "Divya Nair",
    workerInitials: "DN",
    workerBg: "bg-[#1B3FAB]",
    workerRole: "AI & Automation Expert",
    bid: "₹21,000",
    budget: 21000,
    projectName: "AI Chatbot for Customer Support",
    type: "qa",
    rating: 4.9,
    reviews: 29,
    unread: 1,
    projectStatus: null,
    timelineEvents: [],
    messages: [
      {
        id: 1,
        from: "worker",
        text: "Thanks for the invite! Quick question before I start — should the bot escalate to a human agent after 2 failed resolution attempts, or would you prefer a different threshold?",
        time: "2 hours ago",
      },
    ],
  },
  {
    id: "ananya",
    workerName: "Ananya Iyer",
    workerInitials: "AI",
    workerBg: "bg-[#FF6B2C]",
    workerRole: "Digital Marketing Strategist",
    bid: "₹12,400",
    budget: 12400,
    projectName: "AI Chatbot for Customer Support",
    type: "qa",
    rating: 4.8,
    reviews: 52,
    unread: 1,
    projectStatus: null,
    timelineEvents: [],
    messages: [
      {
        id: 1,
        from: "worker",
        text: "Excited to work on the launch campaign once the bot ships! Can you share your current ad account access so I can review past performance?",
        time: "3 hours ago",
      },
    ],
  },
];

// Wallet ledger — migrated from the old static TRANSACTIONS mock. New entries
// are prepended by completeProject() whenever a project actually pays out.
const INITIAL_TRANSACTIONS = [
  { id: "TXN-8821", desc: "Payment Released – React Dashboard", amount: "+₹15,300", date: "Jun 27, 2026", credit: true },
  { id: "TXN-8810", desc: "Funds Secured – AI Chatbot Project", amount: "–₹8,000", date: "Jun 24, 2026", credit: false },
  { id: "TXN-8795", desc: "Withdrawal to HDFC Bank ···4521", amount: "–₹10,000", date: "Jun 21, 2026", credit: false },
  { id: "TXN-8780", desc: "Payment Released – SEO Articles", amount: "+₹11,200", date: "Jun 18, 2026", credit: true },
  { id: "TXN-8762", desc: "Boost Pack – Profile Visibility", amount: "–₹499", date: "Jun 15, 2026", credit: false },
];

export function PlatformProvider({ children }) {
  const [workersDb, setWorkersDb] = useState(WORKERS);
  const [currentUser, setCurrentUser] = useState(WORKERS[0]);
  const [messagesDb, setMessagesDb] = useState(INITIAL_MESSAGES);
  const [invitesDb, setInvitesDb] = useState(INITIAL_INVITES);
  const [businessThreadsDb, setBusinessThreadsDb] = useState(INITIAL_BUSINESS_THREADS);
  // Ready-to-cash-out balance, seeded to match the pre-existing Wallet page.
  // Credited by completeProject() whenever a project reaches COMPLETED.
  const [walletBalance, setWalletBalance] = useState(38750);
  const [transactionHistory, setTransactionHistory] = useState(INITIAL_TRANSACTIONS);

  const updateWorkerAvatar = (workerId, newImageUrl) => {
    setWorkersDb((currentWorkers) =>
      currentWorkers.map((worker) =>
        worker.id === workerId ? { ...worker, avatar: newImageUrl } : worker
      )
    );

    setCurrentUser((prev) =>
      prev?.id === workerId ? { ...prev, avatar: newImageUrl } : prev
    );
  };

  const addMessage = ({ threadId, senderId, receiverId, text }) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setMessagesDb((currentMessages) => [
      ...currentMessages,
      {
        id: `msg-${Date.now()}`,
        threadId,
        senderId,
        receiverId,
        text: trimmedText,
        timestamp: new Date().toISOString(),
        isRead: false,
      },
    ]);
  };

  // Clears the Acceptance Gate for one invite — in production this would
  // also fire a notification back to the business.
  const acceptInvitation = (inviteId) => {
    setInvitesDb((current) =>
      current.map((inv) =>
        inv.id === inviteId
          ? {
              ...inv,
              isAccepted: true,
              messages: [
                ...inv.messages,
                {
                  id: Date.now(),
                  from: "business",
                  text: `Great to have you on board! Let's kick off ${inv.jobTitle}.`,
                  time: "Just now",
                },
              ],
            }
          : inv
      )
    );
  };

  // Advances one invite's Project Lifecycle FSM step (Worker-owned record).
  // Non-terminal only — reaching COMPLETED must go through completeProject()
  // so the payout and ledger entry always happen together with the transition.
  const advanceInviteStatus = (inviteId, newStatus) => {
    setInvitesDb((current) =>
      current.map((inv) =>
        inv.id === inviteId
          ? { ...inv, projectStatus: newStatus, timelineEvents: [...inv.timelineEvents, makeTimelineEvent(newStatus)] }
          : inv
      )
    );
  };

  // Advances one Business Inbox thread's Project Lifecycle FSM step. Reaching
  // FUNDS_SECURED converts a pre-hire "qa" thread into a live "active" project.
  // Non-terminal only — see advanceInviteStatus.
  const advanceBusinessThreadStatus = (threadId, newStatus) => {
    setBusinessThreadsDb((current) =>
      current.map((t) =>
        t.id === threadId
          ? {
              ...t,
              projectStatus: newStatus,
              timelineEvents: [...t.timelineEvents, makeTimelineEvent(newStatus)],
              type: newStatus === "FUNDS_SECURED" ? "active" : t.type,
            }
          : t
      )
    );
  };

  // The Logic Bridge — the ONE path to COMPLETED, on either side of the
  // marketplace. Transitions the FSM, deducts the platform fee, credits the
  // wallet with the worker's earnings, and records the transaction.
  const completeProject = (threadId) => {
    const invite = invitesDb.find((i) => i.id === threadId);
    const thread = businessThreadsDb.find((t) => t.id === threadId);
    const record = invite ?? thread;
    if (!record) return null;

    const { earnings } = calculateEarnings(record.budget);
    const label = record.projectName ?? record.jobTitle ?? "Project";

    if (invite) {
      setInvitesDb((current) =>
        current.map((i) =>
          i.id === threadId
            ? { ...i, projectStatus: "COMPLETED", timelineEvents: [...i.timelineEvents, makeTimelineEvent("COMPLETED")] }
            : i
        )
      );
    }
    if (thread) {
      setBusinessThreadsDb((current) =>
        current.map((t) =>
          t.id === threadId
            ? { ...t, projectStatus: "COMPLETED", timelineEvents: [...t.timelineEvents, makeTimelineEvent("COMPLETED")] }
            : t
        )
      );
    }

    setWalletBalance((bal) => bal + earnings);
    setTransactionHistory((current) => [
      {
        id: `TXN-${Date.now()}`,
        desc: `Payment Released – ${label}`,
        amount: `+₹${earnings.toLocaleString("en-IN")}`,
        date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        credit: true,
      },
      ...current,
    ]);

    return earnings;
  };

  // Rating widget is a controlled input on both chat surfaces — this is the
  // single write path for either side, matched by threadId (ids never
  // collide between invitesDb and businessThreadsDb).
  const submitRating = (threadId, rating, feedback = "") => {
    setInvitesDb((current) =>
      current.map((inv) => (inv.id === threadId ? { ...inv, review: { rating, feedback } } : inv))
    );
    setBusinessThreadsDb((current) =>
      current.map((t) => (t.id === threadId ? { ...t, review: { rating, feedback } } : t))
    );
  };

  // The Retention Engine — spins up a fresh pre-hire thread with the same
  // worker so a business can bring them back for another task in one click.
  const rehireWorker = (threadId) => {
    const original = businessThreadsDb.find((t) => t.id === threadId);
    if (!original) return null;

    const newId = `${threadId}-rehire-${Date.now()}`;
    const newThread = {
      id: newId,
      workerName: original.workerName,
      workerInitials: original.workerInitials,
      workerBg: original.workerBg,
      workerRole: original.workerRole,
      bid: `₹${Number(original.budget || 0).toLocaleString("en-IN")}`,
      budget: original.budget,
      projectName: `New Task with ${original.workerName}`,
      type: "qa",
      rating: 5,
      reviews: original.review?.rating ? 1 : 0,
      unread: 0,
      projectStatus: null,
      timelineEvents: [],
      review: null,
      messages: [
        {
          id: Date.now(),
          from: "business",
          text: `Loved working with you on "${original.projectName}" — excited to bring you on for another task!`,
          time: "Just now",
        },
      ],
    };

    setBusinessThreadsDb((current) => [...current, newThread]);
    return newId;
  };

  const sendInviteMessage = (inviteId, text) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setInvitesDb((current) =>
      current.map((inv) =>
        inv.id === inviteId
          ? { ...inv, messages: [...inv.messages, { id: Date.now(), from: "worker", text: trimmedText, time: "Just now" }] }
          : inv
      )
    );
  };

  return (
    <PlatformContext.Provider
      value={{
        workersDb,
        setWorkersDb,
        currentUser,
        setCurrentUser,
        updateWorkerAvatar,
        messagesDb,
        setMessagesDb,
        addMessage,
        invitesDb,
        setInvitesDb,
        acceptInvitation,
        sendInviteMessage,
        advanceInviteStatus,
        businessThreadsDb,
        setBusinessThreadsDb,
        advanceBusinessThreadStatus,
        completeProject,
        submitRating,
        rehireWorker,
        walletBalance,
        transactionHistory,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatformData() {
  const context = useContext(PlatformContext);

  if (!context) {
    throw new Error("usePlatformData must be used inside PlatformProvider");
  }

  return context;
}
