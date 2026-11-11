import type { JobExtractor } from "./types";
import { firstLink, firstText } from "./utils";

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
  location: firstText(document, [
    "[class*='location']",
    "[class*='job-location']",
  ]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]),
});
