import type { JobExtractor } from "./types";
import { firstLink, firstText } from "./utils";

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
  location: firstText(document, [
    "[class*='location']",
    "[class*='job-location']",
  ]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]),
});
