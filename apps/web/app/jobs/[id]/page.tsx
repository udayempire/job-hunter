"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import { JobDetailsView } from "../../../components/job-details-view";
import { getJob, updateJobStatus, type JobDetails } from "../../../lib/jobs-api";
import type { JobStatus } from "../../../components/types";

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user || !params.id) return;
    getJob(params.id).then(setJob).catch((reason: Error) => setError(reason.message));
  }, [authLoading, params.id, user]);

  if (!user && !authLoading) return <main className="grid min-h-screen place-items-center bg-[#f7f4ef] px-5 text-[#302a28]"><div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_80px_rgba(48,42,40,0.12)]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">Private workspace</p><h1 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">Sign in to view this job</h1><Link href="/login" className="mt-6 inline-flex rounded-full bg-[#292323] px-5 py-3 text-sm font-semibold text-white">Continue with Google</Link></div></main>;
  if (authLoading || (!job && !error)) return <main className="min-h-screen bg-[#f7f4ef] p-8"><div className="mx-auto max-w-5xl"><div className="h-48 animate-pulse rounded-[2rem] bg-[#e9dfd7]" /></div></main>;
  if (error || !job) return <main className="grid min-h-screen place-items-center bg-[#f7f4ef] text-center"><div><p className="text-sm text-[#847a74]">{error || "Job not found"}</p><Link href="/" className="mt-4 inline-flex rounded-full bg-[#292323] px-5 py-3 text-sm font-semibold text-white">Back to dashboard</Link></div></main>;

  return <JobDetailsView job={job} onStatusChange={async (status: JobStatus) => { await updateJobStatus(job.id, status); setJob({ ...job, status }); }} />;
}
