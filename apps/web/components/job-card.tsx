import { Icon } from "./icon";
import type { Job, JobStatus } from "./types";
import { ShareJobButton } from "./share-job-button";
import { EditJobDialog } from "./edit-job-dialog";
import { PublicJobDetailsButton } from "./public-job-details-button";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { createPublicJobShareLink } from "../lib/profiles-api";
import { DeleteJobButton } from "./delete-job-button";

const statusStyles = {
  Saved: "bg-zinc-800 text-[var(--copy)]",
  Review: "bg-zinc-800 text-[var(--copy)]",
  Applied: "bg-[var(--gold-surface)] text-[var(--gold-ink)]",
  Rejected: "bg-[#3a2421] text-[var(--error)]",
};

type CompanyLinkKind = "website" | "linkedin" | "x";

function CompanyLinkIcon({
  href,
  label,
  kind,
}: {
  href?: string;
  label: string;
  kind: CompanyLinkKind;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="inline-grid size-[29px] place-items-center text-[var(--gold-link)] transition hover:opacity-70"
    >
      {kind === "website" ? (
        <img
          src="/social-icons/website.png"
          alt=""
          className="size-[26px] object-contain"
        />
      ) : (
        <img
          src={
            kind === "linkedin"
              ? "/social-icons/LI-In-Bug2.png"
              : "/social-icons/x.png"
          }
          alt=""
          className="size-[26px] object-contain"
        />
      )}
    </a>
  );
}

export function JobCard({
  job,
  onStatusChange,
  onJobUpdated,
  onJobDeleted,
  showStatus = true,
  profileMode = false,
  profileHandle,
  showShare = true,
  useSharedDetails = false,
}: {
  job: Job;
  onStatusChange: (id: string, status: JobStatus) => void;
  onJobUpdated: (job: Job) => void;
  onJobDeleted?: (id: string) => void;
  showStatus?: boolean;
  profileMode?: boolean;
  profileHandle?: string;
  showShare?: boolean;
  useSharedDetails?: boolean;
}) {
  const router = useRouter();

  async function openDetails(
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ) {
    const target = event.target as HTMLElement;
    if (target.closest("a, button, select, input, textarea, label")) return;
    if (useSharedDetails && profileHandle) {
      window.location.assign(
        await createPublicJobShareLink(profileHandle, job.id),
      );
      return;
    }
    router.push(`/jobs/${job.id}`);
  }

  return (
    <article
      className="group flex h-full cursor-pointer flex-col border border-[var(--border)] bg-[var(--paper)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--gold-border)]"
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
            <p className="mt-1 text-sm text-[var(--copy)]">{job.company}</p>
            {/* {job.salary && (
              <p className="mt-1 text-xs font-medium text-[var(--gold-ink)]">
                {job.salary}
              </p>
            )} */}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!profileMode && <EditJobDialog job={job} onSaved={onJobUpdated} />}
          {!profileMode && onJobDeleted && (
            <DeleteJobButton
              jobId={job.id}
              jobTitle={job.title}
              onDeleted={() => onJobDeleted(job.id)}
            />
          )}
          {showStatus && (
            <>
              <label className="sr-only" htmlFor={`status-${job.id}`}>
                Job status for {job.title}
              </label>
              <select
                id={`status-${job.id}`}
                value={job.status}
                onChange={(event) =>
                  onStatusChange(job.id, event.target.value as JobStatus)
                }
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
      <div className="mt-5 grid grid-cols-2 divide-x divide-[var(--border)] border border-[var(--border)] bg-[var(--control)] text-sm">
        <div className="min-w-0 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Location
          </p>
          <p className="mt-1 truncate text-[var(--ink)]">
            {job.location === "Location not specified"
              ? "Not added"
              : job.location}
          </p>
        </div>
        <div className="min-w-0 p-3">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            Salary
          </p>
          <p className="mt-1 truncate text-[var(--ink)]">
            {job.salary || "Not added"}
          </p>
        </div>
      </div>
      <p className="mt-4 min-h-[3rem] text-sm leading-6 text-[var(--copy)]">
        {job.summary}
      </p>
      {(job.companyWebsite || job.companyLinkedin || job.companyX) && (
        <div className="mt-4 flex items-center gap-3 py-3 border-[var(--divider)] ">
          {/* <span className="text-xs font-medium text-[var(--muted)]">
            Company
          </span> */}
          <div className="flex items-center gap-3">
            <CompanyLinkIcon
              href={job.companyWebsite}
              label={`${job.company} website`}
              kind="website"
            />
            <CompanyLinkIcon
              href={job.companyLinkedin}
              label={`${job.company} on LinkedIn`}
              kind="linkedin"
            />
            <CompanyLinkIcon
              href={job.companyX}
              label={`${job.company} on X`}
              kind="x"
            />
          </div>
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--divider)] pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <Icon name="calendar" size={14} /> Added {job.age || "recently"}
        </span>
        <div className="flex items-center gap-2">
          {showShare && (
            <ShareJobButton jobId={job.id} job={job} variant="icon" />
          )}
          {(job.applyLink || job.detailsUrl) && (
            <a
              href={job.applyLink ?? job.detailsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={job.applyLink ? `Apply to ${job.title}` : `View details for ${job.title}`}
              title={job.applyLink ? "Apply" : "View job details"}
              className="inline-flex items-center gap-1.5 border border-[#32634b] bg-[#1f4d3a] px-3 py-1.5 text-xs font-semibold text-[#e9f5eb] transition hover:bg-[#173b2e]"
            >
              Apply <Icon name="external" size={14} />
            </a>
          )}
          {useSharedDetails && profileHandle ? (
            <PublicJobDetailsButton handle={profileHandle} jobId={job.id} />
          ) : (
            <button
              type="button"
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="inline-flex items-center gap-1.5 border border-[var(--gold-border)] bg-[var(--gold-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--gold-ink)] transition hover:bg-[#483d1d]"
            >
              Details <Icon name="arrow" size={13} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
