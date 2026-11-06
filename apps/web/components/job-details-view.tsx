"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthStatus } from "./auth-status";
import { Icon } from "./icon";
import { ShareJobButton } from "./share-job-button";
import type { JobDetails } from "../lib/jobs-api";
import type { JobStatus } from "./types";

const statusStyles = {
  Saved: "bg-[#f3f0ed] text-[#6f6762]",
  Review: "bg-[#f1ebfb] text-[#7752a5]",
  Applied: "bg-[#eaf0f8] text-[#4f719b]",
  Rejected: "bg-[#faeaea] text-[#a05c5c]",
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
      className={`rounded-2xl border border-black/8 bg-white p-5 ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b6b4b]">
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
      className="inline-flex items-center gap-1.5 rounded-full bg-[#faf6f1] px-3 py-2 text-sm font-medium text-[#6d4d3a] transition hover:bg-[#f1e5db]"
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
    <main className="min-h-screen bg-[#f7f4ef] text-[#302a28]">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 lg:py-8">
        <header className="flex items-center justify-between">
          <Link href={shared ? "/" : "/"} className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-[#292323] text-white">
              <Icon name="spark" size={18} />
            </span>
            <span className="text-base font-semibold tracking-[-0.03em]">
              Job Hunter
            </span>
          </Link>
          {headerAction ?? (!shared && <AuthStatus />)}
        </header>
        <Link
          href={shared ? "/" : "/"}
          className="mt-10 inline-flex text-sm font-medium text-[#847a74] hover:text-[#302a28]"
        >
          ← {shared ? "Explore Job Hunter" : "Back to your pipeline"}
        </Link>
        <section className="mt-5 rounded-[2rem] bg-[#292323] p-7 text-white sm:p-10">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#a87556] text-lg font-semibold">
                {job.company.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-[#d8ad8e]">{job.company}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">
                  {job.title}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#c9bfba]">
                  <span>{job.location}</span>
                  {job.salary && (
                    <>
                      <span>·</span>
                      <span>{job.salary}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {!shared && (
              <select
                aria-label="Job status"
                value={status}
                onChange={(event) =>
                  changeStatus(event.target.value as JobStatus)
                }
                className={`rounded-full border-0 px-3 py-2 text-xs font-semibold outline-none ${statusStyles[status]}`}
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
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#625954]">
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
                    <p className="text-sm text-[#8b817b]">
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
                      className="rounded-xl bg-[#faf7f3] p-3"
                    >
                      <p className="text-sm font-medium text-[#403733]">
                        {recruiter.role || "Recruiter contact"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#6d4d3a]">
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
                  <p className="text-sm text-[#8b817b]">
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
                  <dt className="text-[#8b817b]">Source</dt>
                  <dd className="text-right text-[#403733]">{job.source}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8b817b]">Location</dt>
                  <dd className="text-right text-[#403733]">{job.location}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8b817b]">Salary</dt>
                  <dd className="text-right text-[#403733]">
                    {job.salary ?? "Not added"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8b817b]">Status</dt>
                  <dd className="text-right text-[#403733]">{status}</dd>
                </div>
                {!shared && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#8b817b]">Visibility</dt>
                    <dd className="text-right text-[#403733]">
                      {job.visibility === "PRIVATE"
                        ? "Private"
                        : "Public profile"}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8b817b]">Added</dt>
                  <dd className="text-right text-[#403733]">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </DetailBlock>
            {!shared && (
              <DetailBlock label="Personal notes" className="bg-[#fff8ed]">
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#625954]">
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
