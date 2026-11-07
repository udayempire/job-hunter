import Link from "next/link";
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
}: {
  jobs: Job[];
  onStatusChange: (id: string, status: JobStatus) => void;
  onJobUpdated: (job: Job) => void;
}) {
  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--paper)] shadow-[0_8px_20px_rgba(0,0,0,.18)]">
      <Table className="min-w-[980px] table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[15%] px-6">Company</TableHead>
            <TableHead className="w-[19%]">Role</TableHead>
            <TableHead className="w-[13%]">Location</TableHead>
            <TableHead className="w-[11%]">Salary</TableHead>
            <TableHead className="w-[14%]">Added on</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[16%] pr-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
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
              <TableCell className="py-4 pr-5">
                <div className="flex items-center justify-end gap-1.5">
                  <EditJobDialog job={job} onSaved={onJobUpdated} />
                  <ShareJobButton jobId={job.id} variant="icon" />
                  {job.applyLink && (
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Apply to ${job.title} at ${job.company}`}
                      title="Apply"
                      className="inline-grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--control)] text-[var(--copy)] transition hover:bg-zinc-800"
                    >
                      <Icon name="external" size={15} />
                    </a>
                  )}
                  <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--gold-border)] bg-[var(--gold-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--gold-ink)] hover:bg-[#483d1d]">
                    Details <Icon name="arrow" size={13} />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
