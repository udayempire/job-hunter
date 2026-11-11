import type { JobExtractor } from "./types";
import { firstLink, firstText } from "./utils";

export const extractWellfoundJob: JobExtractor = (document) => ({
  company: firstText(document, [
    "a[href*='/company/']",
    "[data-test='StartupName']",
    "[class*='company-name']",
  ]),
  title: firstText(document, [
    "h1",
    "[data-test='JobTitle']",
    "[class*='job-title']",
  ]),
  salary: firstText(document, [
    "[data-test*='salary']",
    "[class*='salary']",
    "[class*='compensation']",
  ]),
  location: firstText(document, [
    "[data-test*='location']",
    "[class*='location']",
  ]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]),
});
