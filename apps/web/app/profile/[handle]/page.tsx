"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthStatus } from "../../../components/auth-status";
import { Icon } from "../../../components/icon";
import { useAuth } from "../../../components/auth-provider";
import { getJobs } from "../../../lib/jobs-api";
import type { Job } from "../../../components/types";

type PublicProfileDraft = { displayName: string; handle: string; headline: string; bio: string; website: string; isPublic: boolean };

function PublicJobCard({ job }: { job: Job }) {
  return <article className="rounded-2xl border border-black/8 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#c8b6a8] hover:shadow-[0_14px_34px_rgba(35,31,32,0.08)]"><div className="flex items-start gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f5eee8] text-sm font-semibold text-[#95603f]">{job.company.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><h3 className="truncate font-semibold text-[#302a28]">{job.title}</h3><p className="mt-1 text-sm text-[#77706c]">{job.company}{job.location && job.location !== "Location not specified" ? ` · ${job.location}` : ""}</p>{job.salary && <p className="mt-1 text-xs font-medium text-[#6d8b6f]">{job.salary}</p>}</div></div><p className="mt-5 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[#6f6762]">{job.summary}</p><div className="mt-5 flex flex-wrap gap-2">{job.applyLink && <a href={job.applyLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#292323] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#3b3330]">Apply <span aria-hidden>↗</span></a>}{job.detailsUrl && <a href={job.detailsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#faf6f1] px-3.5 py-2 text-xs font-semibold text-[#6d4d3a] transition hover:bg-[#f1e5db]">Job details <span aria-hidden>↗</span></a>}</div></article>;
}

function timeSince(date: string | null) {
  if (!date) return "Recently";
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000));
  if (days < 1) return "Today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function PublicProfilePage() {
  const params = useParams<{ handle: string }>();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<PublicProfileDraft | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [joinedAt, setJoinedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("job-hunter-profile-draft");
    const draft = stored ? JSON.parse(stored) as PublicProfileDraft : null;
    const matchesCurrentUser = user?.profile?.handle === params.handle || draft?.handle === params.handle;
    if (!matchesCurrentUser) return;
    setProfile(draft ?? { displayName: user?.name ?? "", handle: params.handle, headline: "", bio: "", website: "", isPublic: user?.profile?.isPublic ?? false });
    const firstSeen = window.localStorage.getItem("job-hunter-joined-at") ?? new Date().toISOString();
    window.localStorage.setItem("job-hunter-joined-at", firstSeen);
    setJoinedAt(firstSeen);
    if (user) getJobs().then((allJobs) => setJobs(allJobs.filter((job) => job.visibility === "PROFILE"))).catch(() => undefined);
  }, [params.handle, user]);

  const isOwner = user?.profile?.handle === params.handle || profile?.handle === params.handle;
  const publicJobs = useMemo(() => profile?.isPublic ? jobs : [], [jobs, profile?.isPublic]);

  if (loading) return <main className="min-h-screen bg-[#f7f4ef] p-8"><div className="mx-auto max-w-5xl h-48 animate-pulse rounded-[2rem] bg-[#e9dfd7]" /></main>;
  if (!profile || (!profile.isPublic && !isOwner)) return <main className="grid min-h-screen place-items-center bg-[#f7f4ef] px-5 text-center text-[#302a28]"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">Profile unavailable</p><h1 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">This profile is private.</h1><p className="mt-3 text-sm text-[#847a74]">Only the owner can view this profile while it is private.</p><Link href="/" className="mt-5 inline-flex rounded-full bg-[#292323] px-5 py-3 text-sm font-semibold text-white">Visit Job Hunter</Link></div></main>;

  const initials = (profile.displayName || profile.handle).slice(0, 2).toUpperCase();
  return <main className="min-h-screen bg-[#f7f4ef] text-[#302a28]"><div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 lg:py-8"><header className="flex items-center justify-between"><Link href="/" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#292323] text-white"><Icon name="spark" size={18} /></span><span className="text-base font-semibold tracking-[-0.03em]">Job Hunter</span></Link><AuthStatus /></header><section className="mt-10 rounded-[2rem] bg-[#292323] p-7 text-white sm:p-10"><div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start"><div className="flex items-start gap-4"><div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-[#a87556] text-2xl font-semibold">{initials}</div><div><p className="text-sm text-[#d8ad8e]">@{profile.handle}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">{profile.displayName || profile.handle}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#c9bfba]">{profile.headline || "Building the next chapter."}</p></div></div>{isOwner && <Link href="/profile" className="inline-flex shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#6d4d3a] transition hover:bg-[#f4ece5]">Edit profile</Link>}</div>{profile.bio && <p className="mt-8 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[#c9bfba]">{profile.bio}</p>}{profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="mt-6 inline-flex text-sm font-medium text-[#e5b995] hover:underline">{profile.website.replace(/^https?:\/\//, "")} ↗</a>}</section><section className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white p-5"><p className="text-2xl font-semibold tracking-[-0.05em] text-[#302a28]">{publicJobs.length}</p><p className="mt-1 text-sm text-[#847a74]">Public jobs</p></div><div className="rounded-2xl bg-white p-5"><p className="text-2xl font-semibold tracking-[-0.05em] text-[#302a28]">{publicJobs.filter((job) => job.status === "Applied").length}</p><p className="mt-1 text-sm text-[#847a74]">Jobs applied</p></div><div className="rounded-2xl bg-white p-5"><p className="text-2xl font-semibold tracking-[-0.05em] text-[#302a28]">{timeSince(joinedAt)}</p><p className="mt-1 text-sm text-[#847a74]">Joined Job Hunter</p></div></section><section className="mt-10"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">Public board</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Jobs worth sharing</h2>{publicJobs.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{publicJobs.map((job) => <PublicJobCard key={job.id} job={job} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-black/15 bg-white/60 p-12 text-center"><p className="text-sm font-medium text-[#625954]">No public jobs yet.</p><p className="mt-2 text-sm text-[#918781]">When this person marks a job public, it will appear here.</p></div>}</section></div></main>;
}
