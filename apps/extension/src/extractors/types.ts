export type ExtractedJob = {
  detailsUrl?: string;
  company?: string;
  title?: string;
  salary?: string;
  location?: string;
  description?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companyX?: string;
};

export type JobExtractor = (document: Document) => ExtractedJob;
