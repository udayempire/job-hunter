"use client";

import { useCallback, useEffect, useState } from "react";
import { AddJobDialog } from "./add-job-dialog";
import { Icon } from "./icon";
import { JobList } from "./job-list";
import type { Job, JobDraft, JobStatus } from "./types";
import { createJob, getJobs, updateJobStatus } from "../lib/jobs-api";
import { useAuth } from "./auth-provider";
import { AppBar } from "./app-bar";

export function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { user, loading: authLoading } = useAuth();

  const loadJobs = useCallback(async () => {
    if (!user) return;
    try {
      const loadedJobs = await getJobs();
      setJobs(loadedJobs);
    } catch {
      // Keep the last known job list without exposing backend failures in the UI.
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    void loadJobs();
    const refresh = () => void loadJobs();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [authLoading, loadJobs, user]);

  async function handleAdd(draft: JobDraft) {
    try {
      const createdJob = await createJob(draft);
      setJobs((current) => [createdJob, ...current]);
    } catch {
      const fallbackJob: Job = {
        id: `job-${Date.now()}`,
        url: draft.applyLink,
        applyLink: draft.applyLink,
        company: draft.company,
        title: draft.title,
        location: draft.location ?? "Location not specified",
        source: "Manual entry",
        score: 0,
        status: "Saved",
        age: "Added just now",
        tags: [],
        summary: draft.description ?? "No description added.",
        detailsUrl: draft.detailsUrl,
        salary: draft.salary,
        companyWebsite: draft.companyWebsite,
        companyLinkedin: draft.companyLinkedin,
        companyX: draft.companyX,
        personalNotes: draft.personalNotes,
        recruiters: draft.recruiters,
        visibility: draft.visibility,
      };
      setJobs((current) => [fallbackJob, ...current]);
    }
  }

  async function handleStatusChange(id: string, status: JobStatus) {
    setJobs((current) =>
      current.map((job) => (job.id === id ? { ...job, status } : job)),
    );
    try {
      await updateJobStatus(id, status);
    } catch {
      /* Mock jobs remain usable while the API is offline. */
    }
  }

  function handleJobUpdated(updatedJob: Job) {
    setJobs((current) =>
      current.map((job) => (job.id === updatedJob.id ? updatedJob : job)),
    );
  }
  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <AppBar />
      <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-10 sm:px-8 lg:px-[3.7rem] lg:pt-11">
        <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="mt-3.5 text-3xl font-semibold tracking-[-0.055em] text-[var(--ink)] [font-family:Georgia,serif] sm:text-[2.65rem]">
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
        />
      </div>
    </main>
  );
}
