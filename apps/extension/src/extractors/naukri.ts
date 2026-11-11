import type { JobExtractor } from "./types";
import { firstLink, firstText } from "./utils";

export const extractNaukriJob: JobExtractor = (document) => ({
  company: firstText(document, [
    ".jd-header-comp-name",
    "[class*='company-name']",
  ]),
  title: firstText(document, [
    ".jd-header-title",
    "[class*='jd-header-title']",
    "h1",
  ]),
  salary: firstText(document, [
    ".salary",
    "[class*='salary']",
    "[class*='compensation']",
  ]),
  location: firstText(document, [
    ".location",
    "[class*='location']",
  ]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]),
});
