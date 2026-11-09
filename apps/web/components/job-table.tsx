import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { PublicJobDetailsButton } from "./public-job-details-button";
import { createPublicJobShareLink } from "../lib/profiles-api";
import { EditJobDialog } from "./edit-job-dialog";
import { Icon } from "./icon";
import { ShareJobButton } from "./share-job-button";
import type { Job, JobStatus } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const statusStyles: Record<JobStatus, string> = {
  Saved: "bg-zinc-800 text-[var(--copy)]",
  Review: "bg-zinc-800 text-[var(--copy)]",
  Applied: "bg-[var(--gold-surface)] text-[var(--gold-ink)]",
  Rejected: "bg-[#3a2421] text-[var(--error)]",
};

const statusDotStyles: Record<JobStatus, string> = {
  Saved: "bg-[var(--muted)]",
  Review: "bg-[var(--muted)]",
  Applied: "bg-[var(--gold)]",
  Rejected: "bg-[var(--error)]",
};

export function JobTable({
  jobs,
  onStatusChange,
  onJobUpdated,
  showStatus = true,
  profileMode = false,
  profileHandle,
  showShare = true,
  useSharedDetails = false,
}: {
  jobs: Job[];
  onStatusChange: (id: string, status: JobStatus) => void;
  onJobUpdated: (job: Job) => void;
  showStatus?: boolean;
  profileMode?: boolean;
  profileHandle?: string;
  showShare?: boolean;
  useSharedDetails?: boolean;
}) {
  const router = useRouter();

  async function openDetails(
    event: MouseEvent<HTMLTableRowElement> | KeyboardEvent<HTMLTableRowElement>,
    job: Job,
  ) {
    const target = event.target as HTMLElement;
    if (target.closest("a, button, select, input, textarea, label")) return;
    if (useSharedDetails && profileHandle) {
      window.location.assign(await createPublicJobShareLink(profileHandle, job.id));
      return;
    }
    router.push(`/jobs/${job.id}`);
  }

  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--paper)] shadow-[0_8px_20px_rgba(0,0,0,.18)]">
      <Table className="min-w-[980px] table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${showStatus ? "w-[15%]" : "w-[18%]"} px-6 text-center`}>Company</TableHead>
            <TableHead className={`${showStatus ? "w-[19%]" : "w-[22%]"} text-center`}>Role</TableHead>
            <TableHead className={`${showStatus ? "w-[13%]" : "w-[15%]"} text-center`}>Location</TableHead>
            <TableHead className={`${showStatus ? "w-[11%]" : "w-[14%]"} text-center`}>Salary</TableHead>
            <TableHead className={`${showStatus ? "w-[14%]" : "w-[15%]"} text-center`}>Added on</TableHead>
            {showStatus && <TableHead className="w-[12%] text-center">Status</TableHead>}
            <TableHead className={`${showStatus ? "w-[16%]" : "w-[16%]"} pr-5 text-center`}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              className={profileMode ? "cursor-pointer" : ""}
              {...(profileMode
                ? {
                    role: "link",
                    tabIndex: 0,
                    "aria-label": `View details for ${job.title} at ${job.company}`,
                    onClick: (event: MouseEvent<HTMLTableRowElement>) => void openDetails(event, job),
                    onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void openDetails(event, job);
                      }
                    },
                  }
                : {})}
            >
              <TableCell className="px-6 py-4">
                <p className="truncate text-sm font-semibold text-[var(--ink)]" title={job.company}>{job.company}</p>
              </TableCell>
              <TableCell className="py-4">
                <p className="truncate text-sm font-semibold text-[var(--ink)]" title={job.title}>{job.title}</p>
              </TableCell>
              <TableCell className="py-4">
                <p className="flex items-center gap-1.5 truncate text-sm text-[var(--copy)]" title={job.location === "Location not specified" ? "-" : job.location}>
                  {job.location && job.location !== "Location not specified" && <Icon name="pin" size={15} />}
                  {job.location && job.location !== "Location not specified" ? job.location : "-"}
                </p>
              </TableCell>
              <TableCell className="py-4">
                <p className="truncate text-sm text-[var(--copy)]" title={job.salary || "-"}>{job.salary || "-"}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap py-4 text-sm text-[var(--copy)]"><span className="inline-flex items-center gap-2"><Icon name="calendar" size={15} />{job.age || "-"}</span></TableCell>
              {showStatus && (
                <TableCell className="py-4">
                  <label className="sr-only" htmlFor={`table-status-${job.id}`}>Job status for {job.title}</label>
                  <div className="relative inline-flex items-center">
                    <span aria-hidden="true" className={`pointer-events-none absolute left-2.5 size-2 rounded-full ${statusDotStyles[job.status]}`} />
                    <select
                      id={`table-status-${job.id}`}
                      value={job.status}
                      onChange={(event) => onStatusChange(job.id, event.target.value as JobStatus)}
                      className={`rounded-full border-0 py-1.5 pl-6 pr-2.5 text-sm font-medium outline-none ${statusStyles[job.status]}`}
                    >
                      <option>Saved</option>
                      <option>Review</option>
                      <option>Applied</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                </TableCell>
              )}
              <TableCell className="py-4 pr-5">
                <div className="flex items-center justify-end gap-1.5">
                  {!profileMode && <EditJobDialog job={job} onSaved={onJobUpdated} />}
                  {showShare && <ShareJobButton jobId={job.id} job={job} variant="icon" />}
                  {job.applyLink && (
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Apply to ${job.title} at ${job.company}`}
                      title="Apply"
                      className={profileMode
                        ? "inline-flex items-center gap-1.5 border border-[#32634b] bg-[#1f4d3a] px-3 py-1.5 text-xs font-semibold text-[#e9f5eb] transition hover:bg-[#173b2e]"
                        : "inline-grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--control)] text-[var(--copy)] transition hover:bg-zinc-800"}
                    >
                      {profileMode ? <>Apply <Icon name="external" size={14} /></> : <Icon name="external" size={15} />}
                    </a>
                  )}
                  {useSharedDetails && profileHandle ? (
                    <PublicJobDetailsButton handle={profileHandle} jobId={job.id} />
                  ) : (
                    <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 border border-[var(--gold-border)] bg-[var(--gold-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--gold-ink)] hover:bg-[#483d1d]">
                      Details <Icon name="arrow" size={13} />
                    </Link>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
