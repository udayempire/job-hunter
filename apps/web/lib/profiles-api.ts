import type { ApiJob } from "./jobs-api";
import { mapJob } from "./jobs-api";
import type { Job } from "../components/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type ProfileDraftInput = {
  displayName: string;
  handle: string;
  headline: string;
  bio: string;
  location: string;
  website: string;
  isPublic: boolean;
};

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
};

export async function getMyProfile(): Promise<StoredProfile> {
  const response = await fetch(`${apiUrl}/profiles/me`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load profile");
  const payload = (await response.json()) as { data: StoredProfile };
  return payload.data;
}

export async function updateProfile(input: ProfileDraftInput): Promise<StoredProfile> {
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
  const response = await fetch(`${apiUrl}/profiles/${encodeURIComponent(handle)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 404 ? "Profile not found" : "Unable to load profile");
  const payload = (await response.json()) as { data: { profile: PublicProfile; jobs: ApiJob[] } };
  return { profile: payload.data.profile, jobs: payload.data.jobs.map(mapJob) };
}

export async function createPublicJobShareLink(handle: string, jobId: string): Promise<string> {
  const response = await fetch(`${apiUrl}/profiles/${encodeURIComponent(handle)}/jobs/${encodeURIComponent(jobId)}/share`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Unable to open job details");
  const payload = (await response.json()) as { data: { url: string } };
  return payload.data.url;
}
