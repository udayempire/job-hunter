import { Icon } from "./icon";
import type { Job, JobStatus } from "./types";
import { ShareJobButton } from "./share-job-button";
import { EditJobDialog } from "./edit-job-dialog";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { createPublicJobShareLink } from "../lib/profiles-api";

const statusStyles = {
  Saved: "bg-zinc-800 text-[var(--copy)]",
  Review: "bg-zinc-800 text-[var(--copy)]",
  Applied: "bg-[var(--gold-surface)] text-[var(--gold-ink)]",
  Rejected: "bg-[#3a2421] text-[var(--error)]",
};

export function JobCard({
  job,
  onStatusChange,
  onJobUpdated,
  showStatus = true,
  profileMode = false,
  profileHandle,
  showShare = true,
  useSharedDetails = false,
}: {
  job: Job;
  onStatusChange: (id: string, status: JobStatus) => void;
  onJobUpdated: (job: Job) => void;
  showStatus?: boolean;
  profileMode?: boolean;
  profileHandle?: string;
  showShare?: boolean;
  useSharedDetails?: boolean;
}) {
  const router = useRouter();

  async function openDetails(event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a, button, select, input, textarea, label")) return;
    if (useSharedDetails && profileHandle) {
      window.location.assign(await createPublicJobShareLink(profileHandle, job.id));
      return;
    }
    router.push(`/jobs/${job.id}`);
  }

  return (
    <article
      className="group cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--gold-border)]"
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void openDetails(event);
        }
      }}
      aria-label={`View details for ${job.title} at ${job.company}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--gold-surface)] text-sm font-semibold text-[var(--gold-ink)]">
            {job.company.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-[var(--ink)]">
              {job.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--copy)]">
              {job.company} · {job.location}
            </p>
            {job.salary && (
              <p className="mt-1 text-xs font-medium text-[var(--gold-ink)]">
                {job.salary}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!profileMode && <EditJobDialog job={job} onSaved={onJobUpdated} />}
          {showStatus && (
            <>
              <label className="sr-only" htmlFor={`status-${job.id}`}>
                Job status for {job.title}
              </label>
              <select
                id={`status-${job.id}`}
                value={job.status}
                onChange={(event) => onStatusChange(job.id, event.target.value as JobStatus)}
                className={`shrink-0 rounded-full border-0 px-2.5 py-1 text-xs font-medium outline-none ${statusStyles[job.status]}`}
              >
                <option>Saved</option>
                <option>Review</option>
                <option>Applied</option>
                <option>Rejected</option>
              </select>
            </>
          )}
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-[var(--copy)]">{job.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-[var(--muted)]"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[var(--divider)] pt-4">
        <div className="text-xs text-[var(--muted)]">{job.age}</div>
        {job.score > 0 ? (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-[var(--gold-strong)]"
                style={{ width: `${job.score}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-[var(--gold-ink)]">
              {job.score}% fit
            </span>
          </div>
        ) : (
          <span className="text-xs text-[var(--muted)]">Not scored yet</span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {showShare && <ShareJobButton jobId={job.id} variant="icon" />}
        {job.applyLink && (
          <a
            href={job.applyLink}
            target="_blank"
            rel="noreferrer"
            className={profileMode
              ? "inline-flex items-center bg-[#1f4d3a] px-3 py-1.5 text-xs font-semibold text-[#e9f5eb] transition hover:bg-[#173b2e]"
              : "text-sm font-medium text-[var(--muted)] transition hover:text-[var(--gold-ink)]"}
          >
            Apply ↗
          </a>
        )}
      </div>
    </article>
  );
}
