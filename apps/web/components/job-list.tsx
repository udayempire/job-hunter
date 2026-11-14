"use client";

import { useEffect, useMemo, useState } from "react";
import { JobCard } from "./job-card";
import type { Job, JobStatus } from "./types";
import { Icon } from "./icon";
import { ExportJobsButton } from "./export-jobs-button";
import { JobTable } from "./job-table";

const filters: Array<"All" | JobStatus> = [
  "All",
  "Saved",
  "Review",
  "Applied",
  "Rejected",
  "Accepted",
];

export function JobList({
  jobs,
  onStatusChange,
  onJobUpdated,
  onJobDeleted,
  showFilters = true,
  showStatus = true,
  profileMode = false,
  profileHandle,
  showShare = true,
  useSharedDetails = false,
}: {
  jobs: Job[];
  onStatusChange: (id: string, status: JobStatus) => void;
  onJobUpdated: (job: Job) => void;
  onJobDeleted?: (id: string) => void;
  showFilters?: boolean;
  showStatus?: boolean;
  profileMode?: boolean;
  profileHandle?: string;
  showShare?: boolean;
  useSharedDetails?: boolean;
}) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");
  useEffect(() => {
    const savedView = window.localStorage.getItem("job-list-view");
    if (savedView === "grid" || savedView === "list") setView(savedView);
  }, []);
  function changeView(nextView: "grid" | "list") {
    setView(nextView);
    window.localStorage.setItem("job-list-view", nextView);
  }
  const visibleJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          (active === "All" || job.status === active) &&
          `${job.title} ${job.company} ${job.tags.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [active, jobs, query],
  );
  const filterCounts = useMemo(
    () => ({
      All: jobs.length,
      Saved: jobs.filter((job) => job.status === "Saved").length,
      Review: jobs.filter((job) => job.status === "Review").length,
      Applied: jobs.filter((job) => job.status === "Applied").length,
      Rejected: jobs.filter((job) => job.status === "Rejected").length,
      Accepted: jobs.filter((job) => job.status === "Accepted").length,
    }),
    [jobs],
  );
  return (
    <section className="mt-9">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        {showFilters && (
          <div className="order-2 flex w-full gap-0.5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--control)] p-1 lg:order-1 lg:w-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActive(filter)}
                className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm transition ${active === filter ? "bg-[var(--gold-surface)] font-semibold text-[var(--gold-ink)]" : "text-[var(--copy)] hover:bg-zinc-800"}`}
              >
                {filter}{filterCounts[filter] > 0 ? ` (${filterCounts[filter]})` : ""}
              </button>
            ))}
          </div>
        )}
        <div className="order-1 flex w-full items-center gap-4 lg:order-2 lg:w-auto">
          <ExportJobsButton jobs={visibleJobs} filter={active} />
          <div className="relative w-full sm:w-80">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <Icon name="search" size={19} />
            </span>
            <label className="sr-only" htmlFor="job-search">
              Search jobs
            </label>
            <input
              id="job-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jobs..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--control)] py-2.5 pl-11 pr-4 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]"
            />
          </div>
          <div className="flex shrink-0 rounded-xl border border-[var(--border)] bg-[var(--control)] p-1" aria-label="Job view">
            <button type="button" onClick={() => changeView("list")} aria-label="Details view" aria-pressed={view === "list"} className={`grid size-9 place-items-center rounded-lg transition ${view === "list" ? "bg-[var(--gold-surface)] text-[var(--gold-ink)]" : "text-[var(--copy)] hover:bg-zinc-800"}`}>
              <Icon name="list" size={17} />
            </button>
            <button type="button" onClick={() => changeView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} className={`grid size-9 place-items-center rounded-lg transition ${view === "grid" ? "bg-[var(--gold-surface)] text-[var(--gold-ink)]" : "text-[var(--copy)] hover:bg-zinc-800"}`}>
              <Icon name="grid" size={17} />
            </button>
          </div>
        </div>
      </div>
      {visibleJobs.length ? (
        view === "list" ? (
          <JobTable jobs={visibleJobs} onStatusChange={onStatusChange} onJobUpdated={onJobUpdated} onJobDeleted={onJobDeleted} showStatus={showStatus} profileMode={profileMode} profileHandle={profileHandle} showShare={showShare} useSharedDetails={useSharedDetails} />
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} onStatusChange={onStatusChange} onJobUpdated={onJobUpdated} onJobDeleted={onJobDeleted} showStatus={showStatus} profileMode={profileMode} profileHandle={profileHandle} showShare={showShare} useSharedDetails={useSharedDetails} />
            ))}
          </div>
        )
      ) : (
        <div className="mt-7 border border-dashed border-[var(--border)] bg-[var(--paper)] p-12 text-center text-sm text-[var(--muted)]">
          No jobs match this view yet.
        </div>
      )}
    </section>
  );
}
