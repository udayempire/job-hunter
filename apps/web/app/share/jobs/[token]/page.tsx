"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthStatus } from "../../../../components/auth-status";
import { useAuth } from "../../../../components/auth-provider";
import { JobDetailsView } from "../../../../components/job-details-view";
import {
  cloneSharedJob,
  getSharedJob,
  type JobDetails,
} from "../../../../lib/jobs-api";

export default function SharedJobPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params.token) return;
    getSharedJob(params.token)
      .then(setJob)
      .catch((reason: Error) => setError(reason.message));
  }, [params.token]);

  async function saveToBoard() {
    if (!user) {
      router.push("/login");
      return;
    }
    setSaving(true);
    try {
      const cloned = await cloneSharedJob(params.token);
      router.push(`/jobs/${cloned.id}`);
    } catch {
      setError("Unable to save this job right now.");
    } finally {
      setSaving(false);
    }
  }

  if (!job && !error)
    return (
      <main className="min-h-screen bg-[#f7f4ef] p-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-48 animate-pulse rounded-[2rem] bg-[#e9dfd7]" />
        </div>
      </main>
    );
  if (error || !job)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f4ef] text-center">
        <div>
          <p className="text-sm text-[#847a74]">
            {error || "Shared job not found"}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-[#292323] px-5 py-3 text-sm font-semibold text-white"
          >
            Visit Job Hunti
          </Link>
        </div>
      </main>
    );
  const saveAction = (
    <button
      type="button"
      onClick={saveToBoard}
      disabled={saving}
      className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#6d4d3a] transition hover:bg-[#f4ece5] disabled:opacity-60"
    >
      {saving ? "Saving…" : user ? "Save to my board" : "Sign in to save"}
    </button>
  );
  return (
    <JobDetailsView
      job={job}
      shared
      headerAction={
        <div className="flex items-center gap-3">
          <AuthStatus />
          {saveAction}
        </div>
      }
    />
  );
}
