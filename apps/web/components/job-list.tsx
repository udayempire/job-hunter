"use client";

import { Button } from "./ui/button";
import { useEffect, useMemo, useState } from "react";
import { JobCard } from "./job-card";
import { MobileJobCard } from "./mobile-job-card";
import type { Job, JobStatus } from "./types";
import { Icon } from "./icon";
import { ExportJobsButton } from "./export-jobs-button";
import { JobTable } from "./job-table";
import { RefreshCw } from "lucide-react";

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
  onRefresh,
  refreshing = false,
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
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
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
    <section className="mt-5 sm:mt-9">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        {showFilters && (
          <div className="order-2 hidden w-full gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--control)] p-1 xl:order-1 xl:flex xl:w-auto">
            {filters.map((filter) => (
              <Button
                variant="unstyled"
                key={filter}
                type="button"
                onClick={() => setActive(filter)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition xl:px-5 ${active === filter ? "bg-[var(--gold-surface)] font-semibold text-[var(--gold-ink)]" : "text-[var(--copy)] hover:bg-zinc-800"}`}
              >
                {filter}
                {filterCounts[filter] > 0 ? ` (${filterCounts[filter]})` : ""}
              </Button>
            ))}
          </div>
        )}
        <div className="order-2 flex w-full flex-wrap items-center gap-2 xl:w-auto">
          {showFilters && (
            <div className="order-1 min-w-0 flex-1 xl:hidden">
              <label className="sr-only" htmlFor="job-filter">
                Filter jobs by status
              </label>
              <select
                id="job-filter"
                value={active}
                onChange={(event) =>
                  setActive(event.target.value as (typeof filters)[number])
                }
                className="h-10 w-full border border-[var(--border)] bg-[var(--control)] px-3 text-sm font-medium text-[var(--gold-ink)] outline-none focus:border-[var(--gold)]"
              >
                {filters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                    {filterCounts[filter] > 0
                      ? ` (${filterCounts[filter]})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="relative order-4 min-w-0 flex-1 basis-full sm:order-3 sm:basis-48 lg:w-52 lg:flex-none xl:w-72">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <Icon name="search" size={17} />
            </span>
            <label className="sr-only" htmlFor="job-search">
              Search jobs
            </label>
            <input
              id="job-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jobs..."
              className="h-10 w-full border border-[var(--border)] bg-[var(--control)] pl-9 pr-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]"
            />
          </div>
          {onRefresh && (
            <Button
              variant="icon"
              size="icon"
              type="button"
              onClick={() => void onRefresh()}
              disabled={refreshing}
              aria-label={refreshing ? "Refreshing jobs" : "Refresh jobs"}
              title={refreshing ? "Refreshing jobs" : "Refresh jobs"}
              className="order-2 shrink-0 disabled:cursor-wait"
            >
              <RefreshCw
                size={17}
                strokeWidth={1.8}
                className={refreshing ? "animate-spin" : ""}
                aria-hidden="true"
              />
            </Button>
          )}
          <div className="order-3 sm:order-4">
            <ExportJobsButton jobs={visibleJobs} filter={active} />
          </div>
          <div
            className="order-5 ml-auto hidden shrink-0 border border-[var(--border)] bg-[var(--control)] p-1 md:flex lg:ml-0"
            aria-label="Job view"
          >
            <Button
              variant="unstyled"
              type="button"
              onClick={() => changeView("list")}
              aria-label="Details view"
              aria-pressed={view === "list"}
              className={`grid size-9 place-items-center rounded-lg transition ${view === "list" ? "bg-[var(--gold-surface)] text-[var(--gold-ink)]" : "text-[var(--copy)] hover:bg-zinc-800"}`}
            >
              <Icon name="list" size={17} />
            </Button>
            <Button
              variant="unstyled"
              type="button"
              onClick={() => changeView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={`grid size-9 place-items-center rounded-lg transition ${view === "grid" ? "bg-[var(--gold-surface)] text-[var(--gold-ink)]" : "text-[var(--copy)] hover:bg-zinc-800"}`}
            >
              <Icon name="grid" size={17} />
            </Button>
          </div>
        </div>
      </div>
      {visibleJobs.length ? (
        <>
          <div className="mt-3 grid gap-3 md:hidden">
            {visibleJobs.map((job) => (
              <MobileJobCard
                key={job.id}
                job={job}
                onStatusChange={onStatusChange}
                onJobUpdated={onJobUpdated}
                onJobDeleted={onJobDeleted}
                showStatus={showStatus}
                profileMode={profileMode}
                profileHandle={profileHandle}
                showShare={showShare}
                useSharedDetails={useSharedDetails}
              />
            ))}
          </div>
          {view === "list" ? (
            <div className="hidden md:block">
              <JobTable
                jobs={visibleJobs}
                onStatusChange={onStatusChange}
                onJobUpdated={onJobUpdated}
                onJobDeleted={onJobDeleted}
                showStatus={showStatus}
                profileMode={profileMode}
                profileHandle={profileHandle}
                showShare={showShare}
                useSharedDetails={useSharedDetails}
              />
            </div>
          ) : (
            <div className="mt-4 hidden gap-4 md:grid lg:grid-cols-2">
              {visibleJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onStatusChange={onStatusChange}
                  onJobUpdated={onJobUpdated}
                  onJobDeleted={onJobDeleted}
                  showStatus={showStatus}
                  profileMode={profileMode}
                  profileHandle={profileHandle}
                  showShare={showShare}
                  useSharedDetails={useSharedDetails}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-7 border border-dashed border-[var(--border)] bg-[var(--paper)] p-12 text-center text-sm text-[var(--muted)]">
          No jobs match this view yet.
        </div>
      )}
    </section>
  );
}
