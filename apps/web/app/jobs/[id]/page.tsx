"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../components/auth-provider";
import { JobDetailsView } from "../../../components/job-details-view";
import {
  getJob,
  updateJobStatus,
  type JobDetails,
} from "../../../lib/jobs-api";
import type { Job, JobStatus } from "../../../components/types";
import { EditJobDialog } from "../../../components/edit-job-dialog";
import { DeleteJobButton } from "../../../components/delete-job-button";
import { useRouter } from "next/navigation";

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    data: job,
    error,
    isPending: jobLoading,
  } = useQuery({
    queryKey: ["job", params.id],
    queryFn: () => getJob(params.id),
    enabled: !authLoading && Boolean(user && params.id),
  });

  if (!user && !authLoading)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f4ef] px-5 text-[#302a28]">
        <div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_80px_rgba(48,42,40,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">
            Private workspace
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            Sign in to view this job
          </h1>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-[#292323] px-5 py-3 text-sm font-semibold text-white"
          >
            Continue with Google
          </Link>
        </div>
      </main>
    );
  if (authLoading || jobLoading)
    return (
      <main className="min-h-screen bg-[var(--canvas)] p-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-48 animate-pulse bg-zinc-800" />
        </div>
      </main>
    );
  if (error || !job)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f4ef] text-center">
        <div>
          <p className="text-sm text-[#847a74]">
            {error?.message || "Job not found"}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-[#292323] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );

  return (
    <JobDetailsView
      job={job}
      editAction={
        <EditJobDialog
          job={job}
          onSaved={(updatedJob) => {
            queryClient.setQueryData<JobDetails>(["job", job.id], updatedJob);
            queryClient.setQueryData<Job[]>(["jobs"], (current = []) =>
              current.map((listedJob) =>
                listedJob.id === updatedJob.id ? updatedJob : listedJob,
              ),
            );
          }}
        />
      }
      deleteAction={
        <DeleteJobButton
          jobId={job.id}
          jobTitle={job.title}
          variant="text"
          onDeleted={() => {
            queryClient.removeQueries({ queryKey: ["job", job.id] });
            queryClient.setQueryData<Job[]>(["jobs"], (current = []) =>
              current.filter((listedJob) => listedJob.id !== job.id),
            );
            router.replace("/");
          }}
        />
      }
      onStatusChange={async (status: JobStatus) => {
        const updatedJob = await updateJobStatus(job.id, status);
        queryClient.setQueryData(["job", job.id], updatedJob);
        queryClient.setQueryData<Job[]>(["jobs"], (current = []) =>
          current.map((listedJob) =>
            listedJob.id === job.id ? updatedJob : listedJob,
          ),
        );
      }}
    />
  );
}
