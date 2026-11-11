import type { JobExtractor } from "./types";
import { firstText } from "./utils";

export const extractLinkedInJob: JobExtractor = (document) => ({
  company: firstText(document, [".job-details-jobs-unified-top-card__company-name", ".top-card-layout__card a[data-tracking-control-name*='org-name']"]),
  title: firstText(document, [".job-details-jobs-unified-top-card__job-title", ".top-card-layout__title"]),
  salary: firstText(document, [".job-details-jobs-unified-top-card__job-insight", ".job-details-jobs-unified-top-card__primary-description"]),
  location: firstText(document, [".job-details-jobs-unified-top-card__primary-description", ".top-card-layout__first-subline"]),
});
