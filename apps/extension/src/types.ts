export type CapturedJob = {
  company?: string;
  title?: string;
  applyLink?: string;
  detailsUrl?: string;
  source: string;
};

export type ContentMessage = { type: "extract-job" };
export type ContentResponse = Partial<CapturedJob> & { selection?: string };

export type PopupDraft = CapturedJob;
