import type { JobExtractor } from "./types";
import { firstText, normalizeText } from "./utils";

function companyFromLinkedInProfile(document: Document): { name?: string; url?: string } {
  const link = document.querySelector<HTMLAnchorElement>("a[href*='linkedin.com/company/']");
  if (!link) return {};

  return {
    name: normalizeText(link.textContent) || undefined,
    url: link.href || undefined,
  };
}

function jobLocationFromMetadata(document: Document): string | undefined {
  // LinkedIn renders the job location as the first span in a metadata row:
  // "India · 4 months ago · Over 100 people clicked apply".
  const metadata = [...document.querySelectorAll("p")].find((element) => {
    const text = normalizeText(element.textContent);
    return text.includes("·") && /(?:ago|clicked apply|applicants|responses managed)/i.test(text);
  });

  return normalizeText(metadata?.querySelector("span")?.textContent) || undefined;
}

function jobTitleFromVerifiedBadge(document: Document): string | undefined {
  const badge = document.querySelector("[aria-label='Verified job']");
  const title = badge?.closest("p");
  const directText = title && Array.from(title.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => normalizeText(node.textContent))
    .find(Boolean);

  return directText || undefined;
}

export const extractLinkedInJob: JobExtractor = (document) => {
  const companyProfile = companyFromLinkedInProfile(document);

  return {
    company: companyProfile.name || firstText(document, [".job-details-jobs-unified-top-card__company-name", ".top-card-layout__card a[data-tracking-control-name*='org-name']"]),
    title: jobTitleFromVerifiedBadge(document) || firstText(document, ["a[href*='/jobs/view/']", ".job-details-jobs-unified-top-card__job-title", ".top-card-layout__title"]),
    salary: firstText(document, [".job-details-jobs-unified-top-card__job-insight", ".job-details-jobs-unified-top-card__primary-description"]),
    location: jobLocationFromMetadata(document) || firstText(document, [".job-details-jobs-unified-top-card__primary-description", ".top-card-layout__first-subline"]),
    companyLinkedin: companyProfile.url,
  };
};
