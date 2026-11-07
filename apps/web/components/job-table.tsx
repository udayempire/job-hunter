import Link from "next/link";
import { EditJobDialog } from "./edit-job-dialog";
import { Icon } from "./icon";
import { ShareJobButton } from "./share-job-button";
import type { Job, JobStatus } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const statusStyles: Record<JobStatus, string> = {
  Saved: "bg-[#efedeb] text-[#373230]",
  Review: "bg-[#f3e5dd] text-[#63301f]",
  Applied: "bg-[#e4edf6] text-[#28517a]",
  Rejected: "bg-[#faeaea] text-[#a05c5c]",
};

const statusDotStyles: Record<JobStatus, string> = {
  Saved: "bg-[#817c78]",
  Review: "bg-[#a65020]",
  Applied: "bg-[#24659a]",
  Rejected: "bg-[#a05c5c]",
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
    <div className="mt-7 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_20px_rgba(35,31,32,.05)]">
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
                <p className="truncate text-sm font-semibold text-[#282321]" title={job.company}>{job.company}</p>
              </TableCell>
              <TableCell className="py-4">
                <p className="truncate text-sm font-semibold text-[#282321]" title={job.title}>{job.title}</p>
              </TableCell>
              <TableCell className="py-4">
                <p className="flex items-center gap-1.5 truncate text-sm text-[#4f4946]" title={job.location === "Location not specified" ? "-" : job.location}>
                  {job.location && job.location !== "Location not specified" && <Icon name="pin" size={15} />}
                  {job.location && job.location !== "Location not specified" ? job.location : "-"}
                </p>
              </TableCell>
              <TableCell className="py-4">
                <p className="truncate text-sm text-[#4f4946]" title={job.salary || "-"}>{job.salary || "-"}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap py-4 text-sm text-[#4f4946]"><span className="inline-flex items-center gap-2"><Icon name="calendar" size={15} />{job.age || "-"}</span></TableCell>
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
                      className="inline-grid size-8 place-items-center rounded-lg border border-black/10 bg-white text-[#302a28] transition hover:bg-[#f7f3ef]"
                    >
                      <Icon name="external" size={15} />
                    </a>
                  )}
                  <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e7d8cd] bg-[#fcf7f2] px-3 py-1.5 text-xs font-semibold text-[#69381f] hover:bg-[#f7ede5]">
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
