export type ExtractedJob = {
  company?: string;
  title?: string;
  salary?: string;
  location?: string;
  description?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companyX?: string;
  applyLink?: string;
};

export type JobExtractor = (document: Document) => ExtractedJob;
