export type CapturedJob = {
  company?: string;
  title?: string;
  applyLink?: string;
  detailsUrl?: string;
  salary?: string;
  location?: string;
  description?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companyX?: string;
  personalNotes?: string;
  visibility?: "PRIVATE" | "PROFILE";
  source: string;
};

export type ContentMessage = { type: "extract-job" };
export type ContentResponse = Partial<CapturedJob> & { selection?: string };

export type PopupDraft = CapturedJob;
