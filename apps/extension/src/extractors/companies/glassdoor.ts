import type { JobExtractor } from "../types";
import { firstLink, firstText } from "../utils";

function headerText(document: Document, selectors: string[]): string {
  const header = document.querySelector("[data-test='job-details-header']");
  return firstText(header ?? document, selectors);
}

function selectedJobDetailsUrl(document: Document): string | undefined {
  const header = document.querySelector("[data-test='job-details-header']");
  if (!header) return undefined;

  const brandviews = header.getAttribute("data-brandviews") ?? "";
  const headerTitle = header.querySelector<HTMLElement>("h1[id^='jd-job-title-']");
  const jobId = brandviews.match(/jlid=(\d+)/)?.[1] ?? headerTitle?.id.match(/(\d+)$/)?.[1];
  if (!jobId) return undefined;

  const directLink = [...document.querySelectorAll<HTMLAnchorElement>("a[data-test='job-title'][href]")]
    .find((link) => new URL(link.href).searchParams.get("jl") === jobId);
  if (directLink?.href) return directLink.href;

  const listingLink = [...document.querySelectorAll<HTMLAnchorElement>("a[href*='/job-listing/']")]
    .find((link) => new URL(link.href).searchParams.get("jl") === jobId);
  return listingLink?.href;
}

export const extractGlassdoorJob: JobExtractor = (document) => ({
  detailsUrl: selectedJobDetailsUrl(document),
  company: headerText(document, ["a[href*='/Overview/'] h4", "[class*='employerNameHeading']"]),
  title: headerText(document, ["h1[id^='jd-job-title-']", "h1"]),
  salary: headerText(document, ["[data-test='detailSalary']"]),
  location: headerText(document, ["[data-test='location']"]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]),
});
