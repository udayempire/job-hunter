import type { ApiJob } from "./jobs-api";
import { mapJob } from "./jobs-api";
import type { Job } from "../components/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type ProfileDetailsInput = {
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
  isPublic: boolean;
};

export type ProfileDraftInput = ProfileDetailsInput & { handle: string };

export type StoredProfile = Omit<ProfileDraftInput, "displayName" | "headline" | "bio" | "location" | "website"> & {
  displayName: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
};

export type PublicProfile = {
  displayName: string | null;
  handle: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  isPublic: boolean;
  image: string | null;
  joinedAt: string;
  upvote: number;
  downvote: number;
  viewerVote: ProfileVote | null;
};

export type ProfileVote = "UPVOTE" | "DOWNVOTE";

export async function getMyProfile(): Promise<StoredProfile> {
  const response = await fetch(`${apiUrl}/profiles/me`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load profile");
  const payload = (await response.json()) as { data: StoredProfile };
  return payload.data;
}

export async function checkHandleAvailability(handle: string): Promise<boolean> {
  const response = await fetch(`${apiUrl}/profiles/handles/${encodeURIComponent(handle)}/availability`, {
    credentials: "include",
    cache: "no-store",
  });
  if (response.status === 400) return false;
  if (!response.ok) throw new Error("Unable to check username");
  const payload = (await response.json()) as { data: { available: boolean } };
  return payload.data.available;
}

export async function createProfile(input: ProfileDraftInput): Promise<StoredProfile> {
  const response = await fetch(`${apiUrl}/profiles/me`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to create profile");
  }
  const payload = (await response.json()) as { data: StoredProfile };
  return payload.data;
}

export async function updateProfile(input: ProfileDetailsInput): Promise<StoredProfile> {
  const response = await fetch(`${apiUrl}/profiles/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Unable to update profile");
  const payload = (await response.json()) as { data: StoredProfile };
  return payload.data;
}

export async function getPublicProfile(handle: string): Promise<{ profile: PublicProfile; jobs: Job[] }> {
  const response = await fetch(`${apiUrl}/profiles/${encodeURIComponent(handle)}`, { cache: "no-store", credentials: "include" });
  if (!response.ok) throw new Error(response.status === 404 ? "Profile not found" : "Unable to load profile");
  const payload = (await response.json()) as { data: { profile: PublicProfile; jobs: ApiJob[] } };
  return { profile: payload.data.profile, jobs: payload.data.jobs.map(mapJob) };
}

export async function updatePublicProfileVote(
  handle: string,
  vote: ProfileVote | null,
): Promise<Pick<PublicProfile, "upvote" | "downvote" | "viewerVote">> {
  const response = await fetch(`${apiUrl}/profiles/${encodeURIComponent(handle)}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ vote }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error ?? (response.status === 401 ? "Sign in to vote" : "Unable to update vote"));
  }
  const payload = (await response.json()) as {
    data: Pick<PublicProfile, "upvote" | "downvote" | "viewerVote">;
  };
  return payload.data;
}

export async function createPublicJobShareLink(handle: string, jobId: string): Promise<string> {
  const response = await fetch(`${apiUrl}/profiles/${encodeURIComponent(handle)}/jobs/${encodeURIComponent(jobId)}/share`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Unable to open job details");
  const payload = (await response.json()) as { data: { url: string } };
  return payload.data.url;
}
