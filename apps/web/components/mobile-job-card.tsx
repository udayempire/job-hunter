"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Job, JobStatus } from "./types";
import { Icon } from "./icon";
import { EditJobDialog } from "./edit-job-dialog";
import { DeleteJobButton } from "./delete-job-button";
import { ShareJobButton } from "./share-job-button";
import { createPublicJobShareLink } from "../lib/profiles-api";
import { useToast } from "./ui/toast";

type Props = {
  job: Job;
  onStatusChange: (id: string, status: JobStatus) => void;
  onJobUpdated: (job: Job) => void;
  onJobDeleted?: (id: string) => void;
  showStatus: boolean;
  profileMode: boolean;
  profileHandle?: string;
  showShare: boolean;
  useSharedDetails: boolean;
};

export function MobileJobCard({
  job, onStatusChange, onJobUpdated, onJobDeleted, showStatus,
  profileMode, profileHandle, showShare, useSharedDetails,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  async function openDetails() {
    setMenuOpen(false);
    if (useSharedDetails && profileHandle) {
      try {
        window.location.assign(await createPublicJobShareLink(profileHandle, job.id));
      } catch {
        toast({ title: "Could not open job details", description: "Please try again.", variant: "error" });
      }
      return;
    }
    router.push(`/jobs/${job.id}`);
  }

  const jobLink = job.applyLink ?? job.detailsUrl;
  return (
    <article className="border border-[var(--border)] bg-[var(--paper)] p-4 text-[var(--ink)]">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => void openDetails()} className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-base font-semibold">{job.company}</h3>
          <p className="mt-0.5 truncate text-sm text-[var(--copy)]">{job.title}</p>
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={`More actions for ${job.title} at ${job.company}`}
          aria-haspopup="dialog"
          className="-mr-1 -mt-1 grid size-9 shrink-0 place-items-center text-[var(--copy)] hover:bg-[var(--control)] hover:text-[var(--gold-ink)]"
        >
          <MoreVertical size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 grid gap-1.5 text-xs text-[var(--copy)]">
        <p className="flex min-w-0 items-center gap-2"><Icon name="pin" size={14} /><span className="truncate">{job.location === "Location not specified" ? "-" : job.location || "-"}</span></p>
        <p className="flex min-w-0 items-center gap-2"><Icon name="briefcase" size={14} /><span className="truncate">{job.salary || "-"}</span></p>
        <p className="flex items-center gap-2"><Icon name="calendar" size={14} />{job.age || "-"}</p>
      </div>
      {showStatus && (
        <div className="mt-3">
          <label className="sr-only" htmlFor={`mobile-status-${job.id}`}>Job status for {job.title}</label>
          <select
            id={`mobile-status-${job.id}`}
            value={job.status}
            onChange={(event) => onStatusChange(job.id, event.target.value as JobStatus)}
            className="min-h-9 border border-[var(--border)] bg-[var(--control)] px-3 text-xs font-medium text-[var(--ink)] outline-none focus:border-[var(--gold)]"
          >
            <option>Saved</option><option>Review</option><option>Applied</option><option>Rejected</option><option>Accepted</option>
          </select>
        </div>
      )}
      {mounted && menuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end bg-black/65" onClick={() => setMenuOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`Actions for ${job.title} at ${job.company}`}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85dvh] w-full overflow-y-auto border-t border-[var(--border)] bg-[var(--paper)] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(0,0,0,.4)]"
          >
            <div className="mx-auto mt-2 h-1 w-10 bg-[var(--muted)]/60" aria-hidden="true" />
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2">
              <p className="min-w-0 truncate text-sm font-semibold">{job.company} · {job.title}</p>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close job actions" className="grid size-9 shrink-0 place-items-center text-[var(--copy)]"><X size={18} /></button>
            </div>
            {!profileMode && <div className="[&>button]:w-full"><EditJobDialog job={job} variant="menu" onSaved={(updated) => { onJobUpdated(updated); setMenuOpen(false); }} /></div>}
            {!profileMode && onJobDeleted && <DeleteJobButton jobId={job.id} jobTitle={job.title} variant="menu" onDeleted={() => { onJobDeleted(job.id); setMenuOpen(false); }} />}
            {jobLink && <a href={jobLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--ink)] hover:bg-[var(--control)]"><Icon name="external" size={18} />Open job link</a>}
            {showShare && <ShareJobButton jobId={job.id} job={job} variant="menu" />}
            <button type="button" onClick={() => void openDetails()} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--control)]"><Icon name="arrow" size={18} />View details</button>
            {showStatus && (
              <div className="mt-1 border-t border-[var(--border)] pt-1">
                {(["Applied", "Accepted", "Rejected"] as const).map((status) => (
                  <button key={status} type="button" onClick={() => { onStatusChange(job.id, status); setMenuOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--ink)] hover:bg-[var(--control)]"><Icon name={status === "Accepted" ? "check" : "arrow"} size={18} />{status === "Applied" ? "Move to Applied" : `Mark as ${status}`}</button>
                ))}
              </div>
            )}
          </section>
        </div>, document.body,
      )}
    </article>
  );
}
