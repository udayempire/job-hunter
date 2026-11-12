import type { JobExtractor } from "../types";
import { firstLink, firstText, normalizeText } from "../utils";

function labeledLocation(document: Document): string | undefined {
  for (const label of document.querySelectorAll("strong[apptranslate='location'], strong")) {
    if (normalizeText(label.textContent).toLowerCase() !== "location") continue;
    const value = label.parentElement?.querySelector("span.dotted-list")
      || label.parentElement?.querySelector("span");
    const location = normalizeText(value?.textContent);
    if (location) return location;
  }
  return undefined;
}

export const extractUnstopJob: JobExtractor = (document) => ({
  company: firstText(document, [
    "[class*='company-name']",
    "[class*='companyName']",
    "[data-testid*='company']",
  ]),
  title: firstText(document, [
    "h1",
    "[class*='job-title']",
    "[class*='jobTitle']",
  ]),
  salary: firstText(document, [
    "[class*='salary']",
    "[class*='stipend']",
    "[class*='compensation']",
  ]),
  location: labeledLocation(document) || firstText(document, [
    "[class*='location']",
    "[class*='job-location']",
  ]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]),
});
