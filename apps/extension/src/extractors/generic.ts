import type { ExtractedJob } from "./types";
import { firstLink, firstText, structuredJob } from "./utils";

export function extractGenericJob(document: Document): ExtractedJob {
  const structured = structuredJob(document);
  return {
    ...structured,
    company: structured.company || firstText(document, ["[data-testid*='company']", "[class*='company-name']", "[class*='employer']"]),
    title: structured.title || firstText(document, ["h1", "[data-testid*='job-title']", "[class*='job-title']"]),
    salary: structured.salary || firstText(document, ["[data-testid*='salary']", "[data-testid*='compensation']", "[class*='salary']", "[class*='compensation']"]),
    location: structured.location || firstText(document, ["[data-testid*='location']", "[class*='job-location']", "[class*='location']"]),
    companyWebsite: structured.companyWebsite || firstLink(document, ["[data-testid*='company'] a[href]", "[class*='company'] a[href]"]),
    companyLinkedin: structured.companyLinkedin || firstLink(document, ["a[href*='linkedin.com']"]),
    companyX: structured.companyX || firstLink(document, ["a[href*='x.com']", "a[href*='twitter.com']"]),
  };
}
