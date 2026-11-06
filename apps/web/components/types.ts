export type JobStatus = "Saved" | "Review" | "Applied" | "Rejected";

export type Job = {
  id: string;
  url?: string;
  company: string;
  title: string;
  location: string;
  source: string;
  score: number;
  status: JobStatus;
  age: string;
  tags: string[];
  summary: string;
};
