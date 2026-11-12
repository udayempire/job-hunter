import type { JobExtractor } from "../types";
import { firstLink, firstText } from "../utils";

export const extractNaukriJob: JobExtractor = (document) => ({
  company: firstText(document, [
    "a[href*='-jobs-careers-'][title*=' Careers' i]",
    ".jd-header-comp-name",
    "[class*='company-name']",
  ]),
  title: firstText(document, [
    ".jd-header-title",
    "[class*='jd-header-title']",
    "h1",
  ]),
  salary: firstText(document, [
    "div[class*='jhc__salary'] span",
    ".salary",
    "[class*='salary']",
    "[class*='compensation']",
  ]),
  location: firstText(document, [
    "div[class*='jhc__loc'] span[class*='jhc__location']",
    ".location",
    "[class*='location']",
  ]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]),
});
