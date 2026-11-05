import type { Job, JobStatus } from "../components/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type ApiJob = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  source: string | null;
  fitScore: number | null;
  status: string;
  description: string;
  createdAt: string;
};

function mapStatus(status: string): JobStatus {
  const statuses: Record<string, JobStatus> = {
    SAVED: "Saved",
    REVIEWING: "Reviewing",
    APPLY: "Apply",
    APPLIED: "Applied",
  };
  return statuses[status] ?? "Saved";
}

function mapJob(job: ApiJob): Job {
  return {
    id: job.id,
    company: job.company,
    title: job.title,
    location: job.location ?? "Location not specified",
    source: job.source ?? "Manual entry",
    score: job.fitScore ?? 0,
    status: mapStatus(job.status),
    age: new Date(job.createdAt).toLocaleDateString(),
    tags: [],
    summary: job.description,
  };
}

export async function getJobs(): Promise<Job[]> {
  const response = await fetch(`${apiUrl}/jobs`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load jobs");
  const payload = (await response.json()) as { data: ApiJob[] };
  return payload.data.map(mapJob);
}

export async function createJob(input: { company: string; title: string; url: string; description: string; location?: string; source?: string }): Promise<Job> {
  const response = await fetch(`${apiUrl}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Unable to create job");
  const payload = (await response.json()) as { data: ApiJob };
  return mapJob(payload.data);
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<void> {
  const statusMap: Record<JobStatus, string> = { Saved: "SAVED", Reviewing: "REVIEWING", Apply: "APPLY", Applied: "APPLIED" };
  const response = await fetch(`${apiUrl}/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: statusMap[status] }),
  });
  if (!response.ok) throw new Error("Unable to update job status");
}
