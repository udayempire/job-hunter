"use client";

import { useMemo, useState } from "react";
import { JobCard } from "./job-card";
import type { Job, JobStatus } from "./types";

const filters: Array<"All" | JobStatus> = ["All", "Saved", "Reviewing", "Apply", "Applied"];

export function JobList({ jobs, onStatusChange }: { jobs: Job[]; onStatusChange: (id: string, status: JobStatus) => void }) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const visibleJobs = useMemo(() => jobs.filter((job) => (active === "All" || job.status === active) && `${job.title} ${job.company} ${job.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [active, jobs, query]);
  return <section className="mt-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">Your pipeline</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#302a28]">Jobs worth your attention</h2></div><div className="w-full sm:w-56"><label className="sr-only" htmlFor="job-search">Search jobs</label><input id="job-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs" className="w-full rounded-full border border-black/8 bg-white py-2.5 pl-4 pr-4 text-sm outline-none placeholder:text-[#aaa09a] focus:border-[#b49a88]" /></div></div><div className="mt-5 flex gap-1 overflow-x-auto rounded-xl bg-[#f1eeea] p-1">{filters.map((filter) => <button key={filter} onClick={() => setActive(filter)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${active === filter ? "bg-white font-medium text-[#332b28] shadow-sm" : "text-[#817773] hover:text-[#413936]"}`}>{filter}</button>)}</div>{visibleJobs.length ? <div className="mt-4 grid gap-4 lg:grid-cols-2">{visibleJobs.map((job) => <JobCard key={job.id} job={job} onStatusChange={onStatusChange} />)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-black/15 bg-white/60 p-12 text-center text-sm text-[#827873]">No jobs match this view yet.</div>}</section>;
}
