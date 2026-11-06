"use client";

import { useEffect, useState } from "react";
import { AddJobDialog } from "./add-job-dialog";
import { Icon } from "./icon";
import { JobList } from "./job-list";
import { starterJobs } from "./job-data";
import { StatCard } from "./stat-card";
import type { Job, JobStatus } from "./types";
import { createJob, getJobs, updateJobStatus } from "../lib/jobs-api";
import { AuthStatus } from "./auth-status";
import { useAuth } from "./auth-provider";

export function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>(starterJobs);
  const [apiReady, setApiReady] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;
    getJobs().then((loadedJobs) => {
      setJobs(loadedJobs);
      setApiReady(true);
    }).catch(() => undefined);
  }, [authLoading, user]);

  async function handleAdd(job: Job) {
    try {
      const createdJob = await createJob({ company: job.company, title: job.title, applyLink: job.url ?? `https://job-hunter.local/${job.id}`, description: job.summary });
      setJobs((current) => [createdJob, ...current]);
    } catch {
      setJobs((current) => [job, ...current]);
    }
  }

  async function handleStatusChange(id: string, status: JobStatus) {
    setJobs((current) => current.map((job) => job.id === id ? { ...job, status } : job));
    try { await updateJobStatus(id, status); } catch { /* Mock jobs remain usable while the API is offline. */ }
  }
  return <main className="min-h-screen bg-[#f7f4ef] text-[#302a28]"><div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10"><header className="flex items-center justify-between"><a href="#" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#292323] text-white"><Icon name="spark" size={18} /></span><span className="text-base font-semibold tracking-[-0.03em]">Job Hunter</span></a><AuthStatus /></header><section className="relative mt-12 overflow-hidden rounded-[2rem] bg-[#292323] px-6 py-8 text-white sm:px-10 sm:py-10"><div className="relative z-10 max-w-2xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d8ad8e]"><Icon name="spark" size={14} /> Monday, keep moving</div><h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.06em] sm:text-5xl">Find the roles that fit the work you want to do.</h1><p className="mt-4 max-w-lg text-sm leading-6 text-[#c9bfba] sm:text-base">Capture opportunities, understand your fit, and keep every application moving from one calm workspace.</p><div className="mt-7">{user ? <AddJobDialog onAdd={handleAdd} /> : <a href="/login" className="inline-flex items-center rounded-full bg-[#fffdf9] px-5 py-3 text-sm font-semibold text-[#292323] transition hover:bg-[#f4ece5]">Sign in to add a job</a>}</div></div><div className="absolute -right-20 -top-28 size-80 rounded-full border border-white/10" /><div className="absolute -right-5 -bottom-48 size-96 rounded-full border border-[#b47b59]/30" /><div className="absolute right-20 top-12 hidden h-28 w-28 rounded-full bg-[#a87556]/20 blur-2xl sm:block" /></section><section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Active opportunities" value={user ? String(jobs.length).padStart(2, "0") : "—"} detail={user ? (apiReady ? "Synced" : "Loading") : "Sign in to sync"} /><StatCard label="Strong matches" value={user ? String(jobs.filter((job) => job.score >= 80).length).padStart(2, "0") : "—"} detail="80%+ fit" accent="green" /><StatCard label="Applications sent" value={user ? "04" : "—"} detail="This month" accent="violet" /><StatCard label="Follow-ups due" value={user ? "02" : "—"} detail="Next 7 days" /></section><JobList jobs={user ? jobs : starterJobs} onStatusChange={handleStatusChange} /></div></main>;
}
