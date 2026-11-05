export type JobStatus = "Saved" | "Reviewing" | "Apply" | "Applied";

export type Job = {
  id: string;
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
