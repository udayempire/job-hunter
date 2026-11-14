"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import { Avatar } from "../../../components/avatar";
import { JobList } from "../../../components/job-list";
import { updateJobStatus } from "../../../lib/jobs-api";
import {
  getPublicProfile,
  updatePublicProfileVote,
  type PublicProfile,
  type ProfileVote,
} from "../../../lib/profiles-api";
import { AppBar } from "../../../components/app-bar";
import { Icon } from "../../../components/icon";
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [votePending, setVotePending] = useState(false);
  const [voteError, setVoteError] = useState("");
  const { data, isPending: profileLoading } = useQuery({
    queryKey: ["public-profile", params.handle],
    queryFn: () => getPublicProfile(params.handle),
    enabled: Boolean(params.handle),
  });
  const profile = data?.profile ?? null;
  const jobs = data?.jobs ?? [];

  const isOwner =
    user?.profile?.handle?.toLowerCase() === params.handle.toLowerCase();
  async function handleVote(vote: ProfileVote) {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!profile || votePending) return;

    setVotePending(true);
    setVoteError("");
    try {
      const result = await updatePublicProfileVote(
        params.handle,
        profile.viewerVote === vote ? null : vote,
      );
      queryClient.setQueryData<{ profile: PublicProfile; jobs: Job[] }>(
        ["public-profile", params.handle],
        (current) =>
          current
            ? { ...current, profile: { ...current.profile, ...result } }
            : current,
      );
    } catch (error) {
      setVoteError(
        error instanceof Error ? error.message : "Unable to update vote",
      );
    } finally {
      setVotePending(false);
    }
  }

  async function handleStatusChange(id: string, status: JobStatus) {
    queryClient.setQueryData<{ profile: PublicProfile; jobs: Job[] }>(
      ["public-profile", params.handle],
      (current) =>
        current
          ? {
              ...current,
              jobs: current.jobs.map((job) =>
                job.id === id ? { ...job, status } : job,
              ),
            }
          : current,
    );
    try {
      const updatedJob = await updateJobStatus(id, status);
      queryClient.setQueryData<{ profile: PublicProfile; jobs: Job[] }>(
        ["public-profile", params.handle],
        (current) =>
          current
            ? {
                ...current,
                jobs: current.jobs.map((job) =>
                  job.id === id ? updatedJob : job,
                ),
              }
            : current,
      );
    } catch {
      // Preserve the existing profile view if the API is unavailable.
    }
  }

  function handleJobUpdated(updatedJob: Job) {
    queryClient.setQueryData<{ profile: PublicProfile; jobs: Job[] }>(
      ["public-profile", params.handle],
      (current) =>
        current
          ? {
              ...current,
              jobs: current.jobs.map((job) =>
                job.id === updatedJob.id ? updatedJob : job,
              ),
            }
          : current,
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

  return (
    <main className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <AppBar />
      <div className="mx-auto max-w-[75rem] px-5 py-6 sm:px-8 lg:py-8">
        <section className="mt-8 border border-[var(--border)] bg-[var(--paper)] p-5 text-[var(--ink)] sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex w-full items-start gap-3">
              <Avatar
                src={profile.image}
                name={profile.displayName}
                fallback={profile.handle}
                alt={`${profile.displayName || profile.handle}'s profile`}
                className="grid size-12 shrink-0 place-items-center overflow-hidden bg-[var(--gold-surface)] text-lg font-semibold text-[var(--gold-ink)]"
              />
              <div className="w-full">
                <div className="flex w-full items-center justify-between gap-4">
                  <h1 className="mt-1 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">
                    {profile.displayName || profile.handle}
                  </h1>
                  <p className="whitespace-nowrap text-sm font-semibold ]">
                    Joined {timeSince(profile.joinedAt)}
                  </p>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-5 text-[var(--copy)]">
                  {profile.headline || "Building the next chapter."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Upvote ${profile.displayName || profile.handle}`}
                    aria-pressed={profile.viewerVote === "UPVOTE"}
                    title="Upvote this profile"
                    disabled={votePending}
                    onClick={() => void handleVote("UPVOTE")}
                    className={`inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${profile.viewerVote === "UPVOTE" ? "border-[#32634b] bg-[#1f4d3a] text-[#b9e7cb]" : "border-[var(--border)] bg-[var(--control)] text-[var(--copy)] hover:border-[#32634b]"}`}
                  >
                    <Icon name="thumb-up" size={15} />
                    {profile.upvote}
                  </button>
                  <button
                    type="button"
                    aria-label={`Downvote ${profile.displayName || profile.handle}`}
                    aria-pressed={profile.viewerVote === "DOWNVOTE"}
                    title="Downvote this profile"
                    disabled={votePending}
                    onClick={() => void handleVote("DOWNVOTE")}
                    className={`inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${profile.viewerVote === "DOWNVOTE" ? "border-[#70403a] bg-[#3a2421] text-[var(--error)]" : "border-[var(--border)] bg-[var(--control)] text-[var(--copy)] hover:border-[#70403a]"}`}
                  >
                    <Icon name="thumb-down" size={15} />
                    {profile.downvote}
                  </button>
                </div>
                {voteError && (
                  <p className="mt-2 text-xs text-[var(--error)]" role="status">
                    {voteError}
                  </p>
                )}
              </div>
            </div>
          </div>
          {profile.bio && (
            <p className="mt-5 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-[var(--copy)]">
              {profile.bio}
            </p>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-medium text-[var(--gold-link)] hover:underline"
            >
              {profile.website.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </section>
        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-ink)]">
            Public board
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
            Jobs worth sharing
          </h2>
          <JobList
            jobs={jobs}
            onStatusChange={handleStatusChange}
            onJobUpdated={handleJobUpdated}
            showFilters={false}
            showStatus={false}
            profileMode
            profileHandle={profile.handle}
            showShare={false}
            useSharedDetails={!isOwner}
          />
        </section>
      </div>
    </main>
  );
}
