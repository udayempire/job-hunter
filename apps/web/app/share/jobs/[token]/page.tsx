"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { JobDetailsView } from "../../../../components/job-details-view";
import { getSharedJob, type JobDetails } from "../../../../lib/jobs-api";

export default function SharedJobPage() {
  const params = useParams<{ token: string }>();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.token) return;
    getSharedJob(params.token).then(setJob).catch((reason: Error) => setError(reason.message));
  }, [params.token]);

  if (!job && !error) return <main className="min-h-screen bg-[#f7f4ef] p-8"><div className="mx-auto max-w-5xl"><div className="h-48 animate-pulse rounded-[2rem] bg-[#e9dfd7]" /></div></main>;
  if (error || !job) return <main className="grid min-h-screen place-items-center bg-[#f7f4ef] text-center"><div><p className="text-sm text-[#847a74]">{error || "Shared job not found"}</p><Link href="/" className="mt-4 inline-flex rounded-full bg-[#292323] px-5 py-3 text-sm font-semibold text-white">Visit Job Hunter</Link></div></main>;
  return <JobDetailsView job={job} shared />;
}
