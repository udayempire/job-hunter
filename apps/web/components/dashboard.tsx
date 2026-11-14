"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AddJobDialog } from "./add-job-dialog";
import { Icon } from "./icon";
import { JobList } from "./job-list";
import type { Job, JobDraft, JobStatus } from "./types";
import {
  createJob,
  getJobs,
  type JobDetails,
  updateJobStatus,
} from "../lib/jobs-api";
import { useAuth } from "./auth-provider";
import { AppBar } from "./app-bar";

export function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: getJobs,
    enabled: !authLoading && Boolean(user),
  });

  async function handleAdd(draft: JobDraft) {
    const createdJob = await createJob(draft);
    queryClient.setQueryData<Job[]>(["jobs"], (current = []) => [
      createdJob,
      ...current,
    ]);
  }

  async function handleStatusChange(id: string, status: JobStatus) {
    queryClient.setQueryData<Job[]>(["jobs"], (current = []) =>
      current.map((job) => (job.id === id ? { ...job, status } : job)),
    );
    queryClient.setQueryData<JobDetails>(["job", id], (current) =>
      current ? { ...current, status } : current,
    );
    try {
      const updatedJob = await updateJobStatus(id, status);
      queryClient.setQueryData<Job[]>(["jobs"], (current = []) =>
        current.map((job) => (job.id === id ? updatedJob : job)),
      );
      queryClient.setQueryData<JobDetails>(["job", id], updatedJob);
    } catch {
      /* Mock jobs remain usable while the API is offline. */
    }
  }

  function handleJobUpdated(updatedJob: Job) {
    queryClient.setQueryData<Job[]>(["jobs"], (current = []) =>
      current.map((job) => (job.id === updatedJob.id ? updatedJob : job)),
    );
    queryClient.setQueryData<JobDetails>(["job", updatedJob.id], (current) =>
      current ? { ...current, ...updatedJob } : current,
    );
  }

  function handleJobDeleted(id: string) {
    queryClient.setQueryData<Job[]>(["jobs"], (current = []) =>
      current.filter((job) => job.id !== id),
    );
    queryClient.removeQueries({ queryKey: ["job", id] });
  }
  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <AppBar />
      <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-10 sm:px-8 lg:px-[3.7rem] lg:pt-11">
        <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="mt-3.5 text-3xl font-semibold tracking-[-0.055em] text-[var(--ink)] sm:text-[2.65rem]">
              Jobs worth your attention
            </h1>
            <p className="mt-2 text-base text-[var(--copy)]">
              Track, manage, and move forward on your job applications.
            </p>
          </div>
          <div className="shrink-0">
            {user ? (
              <AddJobDialog
                onAdd={handleAdd}
                trigger={
                  <span className="inline-flex items-center gap-2.5 rounded-lg bg-[var(--gold)] px-6 py-3 text-base font-semibold text-[var(--canvas)] transition hover:bg-[var(--gold-strong)]">
                    <Icon name="plus" size={19} /> Add Job
                  </span>
                }
              />
            ) : (
              <a
                href="/login"
                className="inline-flex items-center rounded-lg bg-[var(--gold)] px-6 py-3 text-base font-semibold text-[var(--canvas)] transition hover:bg-[var(--gold-strong)]"
              >
                Sign in to add a job
              </a>
            )}
          </div>
        </section>
        <JobList
          jobs={jobs}
          onStatusChange={handleStatusChange}
          onJobUpdated={handleJobUpdated}
          onJobDeleted={handleJobDeleted}
        />
      </div>
    </main>
  );
}
