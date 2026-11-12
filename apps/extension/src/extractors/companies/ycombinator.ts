import type { JobExtractor } from "../types";
import { firstLink, firstText, normalizeText } from "../utils";

function labeledValue(document: Document, label: string): string {
  for (const row of document.querySelectorAll("div.flex.flex-row.justify-between")) {
    const key = normalizeText(row.children.item(0)?.textContent).replace(/:$/, "").toLowerCase();
    if (key !== label.toLowerCase()) continue;
    return normalizeText(row.children.item(1)?.textContent);
  }
  return "";
}

export const extractYCombinatorJob: JobExtractor = (document) => ({
  company: firstText(document, [
    "a[href^='/companies/']",
    "[class*='company-name']",
  ]),
  title: firstText(document, [
    "h1",
    "[class*='job-title']",
  ]),
  salary: firstText(document, [
    "[class*='salary']",
    "[class*='compensation']",
  ]),
  location: labeledValue(document, "location") || firstText(document, [
    "[class*='location']",
    "[class*='job-location']",
  ]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]),
});
