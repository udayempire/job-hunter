"use client";

import { useState } from "react";
import { ShareJobButton } from "./share-job-button";
import { AppBar } from "./app-bar";
import { Icon } from "./icon";
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

type LinkIcon = "browser" | "external" | "linkedin" | "x";

function LinkMark({ icon }: { icon: LinkIcon }) {
  if (icon === "linkedin") {
    return (
      <img
        src="/social-icons/LI-In-Bug2.png"
        alt=""
        className="size-[26px] object-contain"
      />
    );
  }
  if (icon === "x") {
    return (
      <img
        src="/social-icons/x.png"
        alt=""
        className="size-[26px] object-contain"
      />
    );
  }
  if (icon === "browser") {
    return (
      <img
        src="/social-icons/website.png"
        alt=""
        className="size-[26px] object-contain"
      />
    );
  }
  return <Icon name={icon} size={18} />;
}

function ExternalLink({
  href,
  label,
  icon = "external",
  iconOnly = false,
}: {
  href?: string;
  label: string;
  icon?: LinkIcon;
  iconOnly?: boolean;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={
        iconOnly
          ? "inline-grid size-[29px] shrink-0 place-items-center text-[var(--gold-link)] transition hover:opacity-70"
          : "inline-flex items-center gap-1.5 border border-[var(--gold-border)] bg-[var(--gold-surface)] px-3 py-2 text-sm font-medium text-[var(--gold-link)] transition hover:bg-[#483d1d]"
      }
    >
      <LinkMark icon={icon} />
      {!iconOnly && label}
    </a>
  );
}

function recruiterLinkIcon(link: string): LinkIcon {
  try {
    const host = new URL(link).hostname.toLowerCase();
    if (host === "x.com" || host.endsWith(".x.com")) return "x";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) {
      return "linkedin";
    }
  } catch {
    // Invalid legacy links keep the generic external-link treatment.
  }
  return "external";
}

function recruiterLinkLabel(link: string) {
  const icon = recruiterLinkIcon(link);
  if (icon === "x") return "X profile";
  if (icon === "linkedin") return "LinkedIn profile";
  return "Profile";
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
              <div className="flex flex-wrap items-center gap-3">
                <ExternalLink
                  href={job.companyWebsite}
                  label="Website"
                  icon="browser"
                  iconOnly
                />
                <ExternalLink
                  href={job.companyLinkedin}
                  label="LinkedIn"
                  icon="linkedin"
                  iconOnly
                />
                <ExternalLink href={job.companyX} label="X" icon="x" iconOnly />
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
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--gold-link)]">
                        {recruiter.email && (
                          <a
                            href={`mailto:${recruiter.email}`}
                            className="hover:underline"
                          >
                            {recruiter.email}
                          </a>
                        )}
                        {recruiter.link && (
                          <ExternalLink
                            href={recruiter.link}
                            label={recruiterLinkLabel(recruiter.link)}
                            icon={recruiterLinkIcon(recruiter.link)}
                            iconOnly
                          />
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
