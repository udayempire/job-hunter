export type JobStatus = "Saved" | "Review" | "Applied" | "Rejected" | "Accepted";
export type JobVisibility = "PRIVATE" | "PROFILE";

export type RecruiterContact = {
  id?: string;
  name?: string;
  role?: string;
  email?: string;
  link?: string;
  sourceUrl?: string;
  notes?: string;
  verificationStatus?: "UNVERIFIED" | "VERIFIED";
};

export type JobDraft = {
  company: string;
  title?: string;
  applyLink?: string;
  detailsUrl?: string;
  description?: string;
  salary?: string;
  location?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companyX?: string;
  personalNotes?: string;
  recruiters?: RecruiterContact[];
  visibility?: JobVisibility;
};

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
  applyLink?: string;
  detailsUrl?: string;
  salary?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companyX?: string;
  personalNotes?: string;
  recruiters?: RecruiterContact[];
  visibility?: JobVisibility;
};
