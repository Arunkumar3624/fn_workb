// Thin fetch wrapper for the real backend (backend/src/server.js).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// The single source of truth for the signed-in user's JWT — written by
// AuthContext on login/register/logout, read here on every request. Kept as
// a plain localStorage key (not React state) so apiFetch can be called from
// plain lib functions (projectsApi.js etc.) without needing a hook.
const TOKEN_KEY = "workbridge_token";
const DEV_BYPASS_TOKEN = "dev_bypass_token_123";
const DEV_BYPASS_USER_STORAGE_KEY = "workbridge_dev_bypass_user";

// DEV BYPASS: local dashboard-development data. This prevents the fake auth
// token from being sent to guarded backend routes, where it would correctly
// fail as "Invalid or expired token." Remove this whole block with the auth
// bypass before production.
const now = new Date();
const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

function timelineFor(statuses) {
  return statuses.map((status, index) => ({
    status,
    at: daysAgo((statuses.length - index) * 3),
    timestamp: daysAgo((statuses.length - index) * 3),
  }));
}

const devWorkers = [
  {
    id: "dev_worker_1",
    role: "worker",
    name: "Priya Sharma",
    title: "Full-Stack Developer",
    avatar_url: null,
    verified: true,
    behavior_score: 840,
    rating: 4.9,
    reviews_count: 32,
    profile: { skills: ["React", "Node.js", "Postgres", "Tailwind"], hourlyRate: 1500, location: "Bengaluru" },
  },
  {
    id: "dev_worker_2",
    role: "worker",
    name: "Arjun Mehta",
    title: "UI/UX Designer",
    avatar_url: null,
    verified: true,
    behavior_score: 770,
    rating: 4.8,
    reviews_count: 24,
    profile: { skills: ["Figma", "Design Systems", "SaaS UX"], hourlyRate: 1200, location: "Mumbai" },
  },
];

let devProjects = [
  {
    id: "dev_project_1",
    business_id: "dev_business_1",
    business_name: "Google Creative Lab",
    worker_id: "dev_worker_1",
    worker_name: "Priya Sharma",
    title: "UI Audit for Search Labs",
    description: "Review the new experiment dashboard, identify UX friction, and deliver a concise audit with prioritized improvements.",
    budget: 65000,
    deadline: daysFromNow(7),
    status: "INVITED",
    platform_fee_pct: 8,
    timeline: timelineFor(["INVITED"]),
  },
  {
    id: "dev_project_2",
    business_id: "dev_business_2",
    business_name: "StartUpX",
    worker_id: "dev_worker_2",
    worker_name: "Arjun Mehta",
    title: "Launch Landing Page",
    description: "Design and build a fast, high-conversion landing page for a product launch campaign.",
    budget: 38000,
    deadline: daysFromNow(3),
    status: "ACCEPTED",
    platform_fee_pct: 8,
    timeline: timelineFor(["INVITED", "ACCEPTED"]),
  },
  {
    id: "dev_project_3",
    business_id: "dev_business_3",
    business_name: "DesignCo Studio",
    worker_id: "dev_worker_1",
    worker_name: "Priya Sharma",
    title: "Brand Logo System",
    description: "Create a logo refresh with three lockups, color guidance, and compact usage notes for the brand team.",
    budget: 22000,
    deadline: daysFromNow(10),
    status: "INVITED",
    platform_fee_pct: 8,
    timeline: timelineFor(["INVITED"]),
  },
];

function getDevUser() {
  const stored = localStorage.getItem(DEV_BYPASS_USER_STORAGE_KEY);
  if (!stored) return { id: "dev_999", email: "dev@workbridge.com", role: "worker", name: "Dev User" };
  try {
    return JSON.parse(stored);
  } catch {
    return { id: "dev_999", email: "dev@workbridge.com", role: "worker", name: "Dev User" };
  }
}

function addTimeline(project, status) {
  return {
    ...project,
    status,
    timeline: [...(project.timeline ?? []), { status, at: new Date().toISOString(), timestamp: new Date().toISOString() }],
  };
}

function devProjectById(id) {
  return devProjects.find((project) => project.id === id) ?? devProjects[0];
}

export function getDevBypassPublicProfile(userId) {
  if (getToken() !== DEV_BYPASS_TOKEN) return null;
  const worker = devWorkers.find((item) => item.id === userId);
  if (worker) return worker;
  const devBusinesses = {
    dev_business_1: {
      id: "dev_business_1",
      role: "business",
      name: "Google Creative Lab",
      title: "Verified Enterprise Client",
      avatar_url: null,
      verified: true,
      behavior_score: 960,
      rating: 4.9,
      reviews_count: 42,
      profile: { location: "Bengaluru", industry: "Technology" },
    },
    dev_business_2: {
      id: "dev_business_2",
      role: "business",
      name: "StartUpX",
      title: "Verified Startup",
      avatar_url: null,
      verified: true,
      behavior_score: 880,
      rating: 4.7,
      reviews_count: 15,
      profile: { location: "Pune", industry: "SaaS" },
    },
    dev_business_3: {
      id: "dev_business_3",
      role: "business",
      name: "DesignCo Studio",
      title: "Verified Creative Team",
      avatar_url: null,
      verified: true,
      behavior_score: 820,
      rating: 4.8,
      reviews_count: 21,
      profile: { location: "Mumbai", industry: "Design" },
    },
  };

  if (devBusinesses[userId]) {
    return devBusinesses[userId];
  }
  return getDevUser();
}

function devBypassFetch(path, { method = "GET", body } = {}) {
  const url = new URL(path, "http://workbridge.local");
  const pathname = url.pathname;

  if (pathname === "/api/auth/me") return getDevUser();

  if (pathname === "/api/wallet") {
    return {
      balance: 18500,
      transactions: [
        { id: "dev_txn_1", type: "PAYOUT", direction: "credit", amount: 16560, reference_note: "Invoice Flow Cleanup payout", created_at: daysAgo(5) },
        { id: "dev_txn_2", type: "FUNDS_SECURED", direction: "debit", amount: 45000, reference_note: "SaaS Dashboard Polish secured", created_at: daysAgo(3) },
      ],
    };
  }

  if (pathname === "/api/wallet/withdraw") {
    return { ok: true, amount: body?.amount, destination: body?.destination };
  }

  if (pathname === "/api/profiles" && url.searchParams.get("role") === "worker") return devWorkers;

  if (pathname === "/api/profiles/me" && method === "PATCH") {
    const current = getDevUser();
    const updated = {
      ...current,
      avatar_url: body?.avatarUrl ?? current.avatar_url,
      title: body?.title ?? current.title,
      profile: { ...(current.profile ?? {}), ...(body?.profilePatch ?? {}) },
    };
    localStorage.setItem(DEV_BYPASS_USER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  if (pathname === "/api/projects") {
    if (method === "POST") {
      const worker = devWorkers.find((item) => item.id === body?.workerId) ?? devWorkers[0];
      const created = {
        id: `dev_project_${Date.now()}`,
        business_id: getDevUser().id,
        business_name: getDevUser().name,
        worker_id: worker.id,
        worker_name: worker.name,
        title: body?.title ?? "Dev Project",
        description: body?.description ?? "",
        budget: Number(body?.budget ?? 0),
        deadline: body?.deadline ?? daysFromNow(14),
        status: "INVITED",
        platform_fee_pct: 8,
        timeline: timelineFor(["INVITED"]),
      };
      devProjects = [created, ...devProjects];
      return created;
    }

    let projects = devProjects;
    const status = url.searchParams.get("status");
    if (status) projects = projects.filter((project) => project.status === status);
    return projects;
  }

  const projectMatch = pathname.match(/^\/api\/projects\/([^/]+)(?:\/([^/]+))?/);
  if (projectMatch) {
    const [, id, action] = projectMatch;
    const project = devProjectById(id);

    if (action === "submissions") {
      if (method === "POST") {
        return {
          id: `dev_submission_${Date.now()}`,
          project_id: id,
          submitted_by: getDevUser().id,
          submitted_by_name: getDevUser().name,
          type: body?.type,
          url: body?.url,
          image_data: body?.imageData,
          caption: body?.caption,
          status: "PENDING_REVIEW",
          created_at: new Date().toISOString(),
        };
      }
      return [];
    }

    if (action === "secure-funds") {
      devProjects = devProjects.map((item) => (item.id === id ? addTimeline(item, "FUNDS_SECURED") : item));
      return devProjectById(id);
    }

    if (action === "complete") {
      devProjects = devProjects.map((item) => (item.id === id ? addTimeline(item, "COMPLETED") : item));
      return devProjectById(id);
    }

    if (method === "PATCH") {
      devProjects = devProjects.map((item) => (item.id === id ? addTimeline(item, body?.status ?? item.status) : item));
      return devProjectById(id);
    }

    return project;
  }

  if (pathname === "/api/reviews") {
    if (method === "POST") {
      return {
        id: `dev_review_${Date.now()}`,
        project_id: body?.projectId,
        reviewer_id: getDevUser().id,
        reviewer_name: getDevUser().name,
        rating: Number(body?.rating ?? 5),
        feedback: body?.feedback ?? "",
        created_at: new Date().toISOString(),
      };
    }
    return [];
  }

  if (pathname === "/api/admin/stats") {
    return {
      totalUsers: 128,
      totalProjects: 42,
      jobsToday: 6,
      platformRevenue: 186000,
      fundsSecuredPool: 730000,
      pendingVerifications: 2,
      openDisputes: 1,
      weeklyRevenue: [
        { day: "Mon", revenue: 12000 },
        { day: "Tue", revenue: 18000 },
        { day: "Wed", revenue: 15000 },
        { day: "Thu", revenue: 26000 },
        { day: "Fri", revenue: 22000 },
      ],
    };
  }

  if (pathname === "/api/admin/verify") return [];
  if (pathname === "/api/admin/disputes") return [];
  if (pathname === "/api/admin/submissions") return [];
  if (pathname.startsWith("/api/admin/")) return { ok: true };

  return {};
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * apiFetch("/api/projects?role=business")
 * apiFetch(`/api/projects/${id}/complete`, { method: "POST" })
 *
 * Attaches the stored JWT if one exists; unauthenticated calls (register,
 * login, public profile reads) simply omit the header rather than failing —
 * the backend decides what's guarded, this client doesn't duplicate that.
 */
export async function apiFetch(path, { method = "GET", body } = {}) {
  const token = getToken();
  if (token === DEV_BYPASS_TOKEN) {
    return devBypassFetch(path, { method, body });
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network failure (backend down, CORS, offline) — distinct from a
    // well-formed error response, since there's no res.status to report.
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, payload?.error?.message ?? `Request failed (${res.status}).`);
  }

  return payload?.data;
}
