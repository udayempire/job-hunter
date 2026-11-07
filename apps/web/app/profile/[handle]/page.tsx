"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthStatus } from "../../../components/auth-status";
import { Icon } from "../../../components/icon";
import { useAuth } from "../../../components/auth-provider";
import { JobList } from "../../../components/job-list";
import { updateJobStatus } from "../../../lib/jobs-api";
import { getPublicProfile, type PublicProfile } from "../../../lib/profiles-api";
import type { Job, JobStatus } from "../../../components/types";

function timeSince(date: string | null) {
  if (!date) return "Recently";
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000),
  );
  if (days < 1) return "Today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function PublicProfilePage() {
  const params = useParams<{ handle: string }>();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    setProfileLoading(true);
    void getPublicProfile(params.handle)
      .then(({ profile: loadedProfile, jobs: loadedJobs }) => {
        setProfile(loadedProfile);
        setJobs(loadedJobs);
      })
      .catch(() => {
        setProfile(null);
        setJobs([]);
      })
      .finally(() => setProfileLoading(false));
  }, [params.handle]);

  const isOwner =
    user?.profile?.handle === params.handle ||
    profile?.handle === params.handle;
  const publicJobs = useMemo(() => jobs, [jobs]);

  async function handleStatusChange(id: string, status: JobStatus) {
    setJobs((current) =>
      current.map((job) => (job.id === id ? { ...job, status } : job)),
    );
    try {
      await updateJobStatus(id, status);
    } catch {
      // Preserve the existing profile view if the API is unavailable.
    }
  }

  function handleJobUpdated(updatedJob: Job) {
    setJobs((current) =>
      current.map((job) => (job.id === updatedJob.id ? updatedJob : job)),
    );
  }

  if (loading || profileLoading)
    return (
      <main className="min-h-screen bg-[var(--canvas)] p-8">
        <div className="mx-auto h-48 max-w-5xl animate-pulse bg-zinc-800" />
      </main>
    );
  if (!profile || (!profile.isPublic && !isOwner))
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--canvas)] px-5 text-center text-[var(--ink)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-ink)]">
            Profile unavailable
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            This profile is private.
          </h1>
          <p className="mt-3 text-sm text-[var(--copy)]">
            Only the owner can view this profile while it is private.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--canvas)]"
          >
            Visit Job Hunti
          </Link>
        </div>
      </main>
    );

  const avatarLetter = (profile.displayName || profile.handle)
    .charAt(0)
    .toUpperCase();
  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <div className="mx-auto max-w-[75rem] px-5 py-6 sm:px-8 lg:py-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center bg-[var(--ink)] text-[var(--canvas)]">
              <Icon name="spark" size={18} />
            </span>
            <span className="text-base font-semibold tracking-[-0.03em] text-[var(--ink)]">
              Job Hunti
            </span>
          </Link>
          <AuthStatus />
        </header>
        <section className="mt-10 border border-[var(--border)] bg-[var(--paper)] p-7 text-[var(--ink)] sm:p-10">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="grid size-20 shrink-0 place-items-center bg-[var(--gold-surface)] text-2xl font-semibold text-[var(--gold-ink)]">
                {avatarLetter}
              </div>
              <div>
                <p className="text-sm text-[var(--gold-ink)]">
                  @{profile.handle}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">
                  {profile.displayName || profile.handle}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--copy)]">
                  {profile.headline || "Building the next chapter."}
                </p>
              </div>
            </div>
            {isOwner && (
              <Link
                href="/profile"
                className="inline-flex shrink-0 border border-[var(--gold-border)] bg-[var(--gold-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--gold-link)] transition hover:bg-[#483d1d]"
              >
                Edit profile
              </Link>
            )}
          </div>
          {profile.bio && (
            <p className="mt-8 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[var(--copy)]">
              {profile.bio}
            </p>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex text-sm font-medium text-[var(--gold-link)] hover:underline"
            >
              {profile.website.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </section>
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="border border-[var(--border)] bg-[var(--paper)] p-5">
            <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
              {publicJobs.length}
            </p>
            <p className="mt-1 text-sm text-[var(--copy)]">Public jobs</p>
          </div>
          <div className="border border-[var(--border)] bg-[var(--paper)] p-5">
            <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
              {publicJobs.filter((job) => job.status === "Applied").length}
            </p>
            <p className="mt-1 text-sm text-[var(--copy)]">Jobs applied</p>
          </div>
          <div className="border border-[var(--border)] bg-[var(--paper)] p-5">
            <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
              {timeSince(profile.joinedAt)}
            </p>
            <p className="mt-1 text-sm text-[var(--copy)]">Joined Job Hunti</p>
          </div>
        </section>
        <section className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-ink)]">
            Public board
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
            Jobs worth sharing
          </h2>
          <JobList
            jobs={publicJobs}
            onStatusChange={handleStatusChange}
            onJobUpdated={handleJobUpdated}
            showFilters={false}
            showStatus={false}
            profileMode
          />
        </section>
      </div>
    </main>
  );
}
