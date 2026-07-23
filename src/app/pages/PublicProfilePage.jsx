import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicProfile } from "../lib/profilesApi";
import WorkerShareableProfile from "../components/worker/WorkerShareableProfile";

// The actual destination behind "Share Profile" — public, unauthenticated
// (getPublicProfile hits the one route in the API with no guard, backed by
// the public_user_profiles view, so nothing PII ever loads here). Without
// this route, sharing would just copy the logged-in-only dashboard URL,
// which anyone without an account could never open.
export default function PublicProfilePage() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getPublicProfile(id)
      .then((data) => {
        if (!cancelled) setWorker(data);
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#1B3FAB]" />
      </div>
    );
  }

  if (loadError || !worker) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">Profile not found</h1>
          <p className="mt-1 text-sm text-slate-500">This link may be broken, or the account no longer exists.</p>
        </div>
      </div>
    );
  }

  return <WorkerShareableProfile worker={worker} />;
}
