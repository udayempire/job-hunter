"use client";

import { useState } from "react";
import { ShareJobButton } from "./share-job-button";
import { AppBar } from "./app-bar";
import type { JobDetails } from "../lib/jobs-api";
import type { JobStatus } from "./types";

const statusStyles = {
  Saved: "bg-zinc-800 text-[var(--copy)]",
  Review: "bg-zinc-800 text-[var(--copy)]",
  Applied: "bg-[var(--gold-surface)] text-[var(--gold-ink)]",
  Rejected: "bg-[#3a2421] text-[var(--error)]",
};

function DetailBlock({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border border-[var(--border)] bg-[var(--paper)] p-5 ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-ink)]">
        {label}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ExternalLink({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 border border-[var(--gold-border)] bg-[var(--gold-surface)] px-3 py-2 text-sm font-medium text-[var(--gold-link)] transition hover:bg-[#483d1d]"
    >
      {label} <span aria-hidden>↗</span>
    </a>
  );
}

export function JobDetailsView({
  job,
  shared = false,
  onStatusChange,
  headerAction,
  editAction,
}: {
  job: JobDetails;
  shared?: boolean;
  onStatusChange?: (status: JobStatus) => Promise<void> | void;
  headerAction?: React.ReactNode;
  editAction?: React.ReactNode;
}) {
  const [status, setStatus] = useState(job.status);

  async function changeStatus(nextStatus: JobStatus) {
    setStatus(nextStatus);
    await onStatusChange?.(nextStatus);
  }

  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <AppBar right={headerAction} showAccount={!shared && !headerAction} />
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 lg:py-8">
        <section className="mt-5 border border-[var(--border)] bg-[var(--paper)] p-7 text-[var(--ink)] sm:p-10">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="grid size-14 shrink-0 place-items-center bg-[var(--gold-surface)] text-lg font-semibold text-[var(--gold-ink)]">
                {job.company.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-[var(--gold-ink)]">{job.company}</p>
                <h1 className="mt-2 text-xl font-semibold tracking-[-0.06em] sm:text-xl">
                  {job.title}
                </h1>
                {/* <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--copy)]">
                  <span>{job.location}</span>
                  {job.salary && (
                    <>
                      <span>·</span>
                      <span>{job.salary}</span>
                    </>
                  )}
                </div> */}
              </div>
            </div>
            {!shared && (
              <select
                aria-label="Job status"
                value={status}
                onChange={(event) =>
                  changeStatus(event.target.value as JobStatus)
                }
                className={`border-0 px-3 py-2 text-xs font-semibold outline-none ${statusStyles[status]}`}
              >
                <option>Saved</option>
                <option>Review</option>
                <option>Applied</option>
                <option>Rejected</option>
              </select>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ExternalLink href={job.applyLink} label="Apply now" />
            <ExternalLink href={job.detailsUrl} label="Job details" />
            {!shared && <ShareJobButton jobId={job.id} variant="icon" />}
            {editAction}
          </div>
        </section>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-5">
            <DetailBlock label="Job description">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--copy)]">
                {job.summary}
              </p>
            </DetailBlock>
            <DetailBlock label="Company links">
              <div className="flex flex-wrap gap-2">
                <ExternalLink href={job.companyWebsite} label="Website" />
                <ExternalLink href={job.companyLinkedin} label="LinkedIn" />
                <ExternalLink href={job.companyX} label="X" />
                {!job.companyWebsite &&
                  !job.companyLinkedin &&
                  !job.companyX && (
                    <p className="text-sm text-[var(--muted)]">
                      No company links added.
                    </p>
                  )}
              </div>
            </DetailBlock>
            <DetailBlock label="Recruiter contacts">
              <div className="space-y-3">
                {job.recruiters?.length ? (
                  job.recruiters.map((recruiter, index) => (
                    <div
                      key={`${recruiter.email ?? recruiter.link ?? "recruiter"}-${index}`}
                      className="border border-[var(--border)] bg-[var(--control)] p-3"
                    >
                      <p className="text-sm font-medium text-[var(--ink)]">
                        {recruiter.role || "Recruiter contact"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--gold-link)]">
                        {recruiter.email && (
                          <a
                            href={`mailto:${recruiter.email}`}
                            className="hover:underline"
                          >
                            {recruiter.email}
                          </a>
                        )}
                        {recruiter.link && (
                          <a
                            href={recruiter.link}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            Profile ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    No recruiter contacts added.
                  </p>
                )}
              </div>
            </DetailBlock>
          </div>
          <aside className="space-y-5">
            <DetailBlock label="Opportunity details">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Location</dt>
                  <dd className="text-right text-[var(--ink)]">
                    {job.location}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Salary</dt>
                  <dd className="text-right text-[var(--ink)]">
                    {job.salary ?? "Not added"}
                  </dd>
                </div>
                {/* <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Status</dt>
                  <dd className="text-right text-[var(--ink)]">{status}</dd>
                </div> */}
                {/* {!shared && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--muted)]">Visibility</dt>
                    <dd className="text-right text-[var(--ink)]">
                      {job.visibility === "PRIVATE"
                        ? "Private"
                        : "Public profile"}
                    </dd>
                  </div>
                )} */}
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Added</dt>
                  <dd className="text-right text-[var(--ink)]">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </DetailBlock>
            {!shared && (
              <DetailBlock
                label="Personal notes"
                className="bg-[var(--gold-surface)]"
              >
                <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--copy)]">
                  {job.personalNotes || "No personal notes added."}
                </p>
              </DetailBlock>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
