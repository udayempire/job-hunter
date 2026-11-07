import type { Job, JobDraft, JobStatus } from "../components/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type ApiJob = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  source: string | null;
  fitScore: number | null;
  status: string;
  applyLink: string | null;
  url: string | null;
  salary: string | null;
  companyWebsite: string | null;
  companyLinkedin: string | null;
  companyX: string | null;
  description: string | null;
  personalNotes: string | null;
  recruiters?: Array<{ role: string | null; email: string | null; link: string | null }>;
  visibility: "PRIVATE" | "PROFILE";
  createdAt: string;
  updatedAt?: string;
  applications?: Array<{ id: string; status: string; appliedAt: string | null; followUpAt: string | null; notes: string | null }>;
};

export type JobDetails = Job & {
  createdAt: string;
  updatedAt: string;
  applications: Array<{ id: string; status: string; appliedAt: string | null; followUpAt: string | null; notes: string | null }>;
};

function mapStatus(status: string): JobStatus {
  const statuses: Record<string, JobStatus> = {
    SAVED: "Saved",
    REVIEW: "Review",
    APPLIED: "Applied",
    REJECTED: "Rejected",
  };
  return statuses[status] ?? "Saved";
}

export function mapJob(job: ApiJob): Job {
  return {
    id: job.id,
    url: job.applyLink ?? undefined,
    applyLink: job.applyLink ?? undefined,
    company: job.company,
    title: job.title,
    location: job.location ?? "Location not specified",
    source: job.source ?? "Manual entry",
    score: job.fitScore ?? 0,
    status: mapStatus(job.status),
    age: new Date(job.createdAt).toLocaleDateString(),
    tags: [],
    summary: job.description ?? "No description added.",
    detailsUrl: job.url ?? undefined,
    salary: job.salary ?? undefined,
    companyWebsite: job.companyWebsite ?? undefined,
    companyLinkedin: job.companyLinkedin ?? undefined,
    companyX: job.companyX ?? undefined,
    personalNotes: job.personalNotes ?? undefined,
    recruiters: (job.recruiters ?? []).map((recruiter) => ({ role: recruiter.role ?? undefined, email: recruiter.email ?? undefined, link: recruiter.link ?? undefined })),
    visibility: job.visibility,
  };
}

function mapJobDetails(job: ApiJob): JobDetails {
  return { ...mapJob(job), createdAt: job.createdAt, updatedAt: job.updatedAt ?? job.createdAt, applications: job.applications ?? [] };
}

export async function getJobs(): Promise<Job[]> {
  let response = await fetch(`${apiUrl}/jobs`, { cache: "no-store", credentials: "include" });
  if (response.status === 401) {
    const refresh = await fetch(`${apiUrl}/auth/refresh`, { method: "POST", credentials: "include" });
    if (refresh.ok) response = await fetch(`${apiUrl}/jobs`, { cache: "no-store", credentials: "include" });
  }
  if (!response.ok) {
    let detail = "";
    try { detail = ((await response.json()) as { error?: string }).error ?? ""; } catch { /* response was not JSON */ }
    throw new Error(`Unable to load jobs (${response.status})${detail ? `: ${detail}` : ""}`);
  }
  const payload = (await response.json()) as { data: ApiJob[] };
  return payload.data.map(mapJob);
}

export async function getJob(id: string): Promise<JobDetails> {
  const response = await fetch(`${apiUrl}/jobs/${encodeURIComponent(id)}`, { cache: "no-store", credentials: "include" });
  if (!response.ok) throw new Error(response.status === 401 ? "Authentication required" : "Unable to load job");
  const payload = (await response.json()) as { data: ApiJob };
  return mapJobDetails(payload.data);
}

export async function getSharedJob(token: string): Promise<JobDetails> {
  const response = await fetch(`${apiUrl}/shared/jobs/${encodeURIComponent(token)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 404 ? "Shared job not found" : "Unable to load shared job");
  const payload = (await response.json()) as { data: ApiJob };
  return mapJobDetails({ ...payload.data, personalNotes: null });
}

export async function cloneSharedJob(token: string): Promise<Job> {
  const response = await fetch(`${apiUrl}/shared/jobs/${encodeURIComponent(token)}/clone`, { method: "POST", credentials: "include" });
  if (!response.ok) throw new Error("Unable to save shared job");
  const payload = (await response.json()) as { data: ApiJob };
  return mapJob(payload.data);
}

export async function createJobShareLink(id: string): Promise<string> {
  const response = await fetch(`${apiUrl}/jobs/${encodeURIComponent(id)}/share`, { method: "POST", credentials: "include" });
  if (!response.ok) throw new Error("Unable to create share link");
  const payload = (await response.json()) as { data: { url: string } };
  return payload.data.url;
}

export async function updateJob(id: string, input: JobDraft): Promise<Job> {
  const response = await fetch(`${apiUrl}/jobs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Unable to update job");
  const payload = (await response.json()) as { data: ApiJob };
  return mapJob(payload.data);
}

export async function createJob(input: JobDraft): Promise<Job> {
  const response = await fetch(`${apiUrl}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Unable to create job");
  const payload = (await response.json()) as { data: ApiJob };
  return mapJob(payload.data);
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<void> {
  const statusMap: Record<JobStatus, string> = { Saved: "SAVED", Review: "REVIEW", Applied: "APPLIED", Rejected: "REJECTED" };
  const response = await fetch(`${apiUrl}/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status: statusMap[status] }),
  });
  if (!response.ok) throw new Error("Unable to update job status");
}
