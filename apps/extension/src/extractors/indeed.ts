import type { JobExtractor } from "./types";
import { firstText } from "./utils";

export const extractIndeedJob: JobExtractor = (document) => ({
  company: firstText(document, ["[data-testid='inlineHeader-companyName']", "[data-testid='company-name']"]),
  title: firstText(document, ["[data-testid='jobsearch-JobInfoHeader-title']", ".jobsearch-JobInfoHeader-title"]),
  salary: firstText(document, ["[data-testid='jobsearch-JobInfoHeader-salary']", "[data-testid='attribute_snippet_testid']"]),
  location: firstText(document, ["[data-testid='job-location']", "[data-testid='inlineHeader-companyLocation']"]),
});
