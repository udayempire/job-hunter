import type { JobExtractor } from "./types";
import { firstLink, firstText } from "./utils";

export const extractGlassdoorJob: JobExtractor = (document) => ({
  company: firstText(document, [
    "[data-test='employerName']",
    "[data-test='employer-name']",
    "[class*='EmployerProfile']",
  ]),
  title: firstText(document, [
    "[data-test='jobTitle']",
    "[data-test='job-title']",
    "[class*='JobDetails_jobTitle']",
    "h1",
  ]),
  salary: firstText(document, [
    "[data-test='detailSalary']",
    "[data-test='salary']",
    "[class*='salary']",
  ]),
  location: firstText(document, [
    "[data-test='location']",
    "[data-test='job-location']",
    "[class*='location']",
  ]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]),
});
