import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getPublicProfile } from "../lib/profilesApi";
import WorkerShareableProfile from "../components/worker/WorkerShareableProfile";
import BusinessShareableProfile from "../components/business/BusinessShareableProfile";

// The actual destination behind "Share Profile" — public, unauthenticated
// (getPublicProfile hits the one route in the API with no guard, backed by
// the public_user_profiles view, so nothing PII ever loads here). Without
// this route, sharing would just copy the logged-in-only dashboard URL,
// which anyone without an account could never open.
//
// getPublicProfile is role-agnostic (public_user_profiles has both worker
// and business rows) — this branches on the fetched profile.role to render
// the right layout. Previously this unconditionally rendered
// WorkerShareableProfile even for a business account, which has no
// job/price section at all — a business sharing their link showed a
// worker-shaped resume template with nothing on it.
export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getPublicProfile(id)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B3FAB]" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">Profile not found</h1>
          <p className="mt-1 text-sm text-slate-500">This link may be broken, or the account no longer exists.</p>
        </div>
      </div>
    );
  }

  return profile.role === "business" ? (
    <BusinessShareableProfile business={profile} />
  ) : (
    <WorkerShareableProfile worker={profile} />
  );
}
