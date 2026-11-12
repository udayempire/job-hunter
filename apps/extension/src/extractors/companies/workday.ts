import type { JobExtractor } from "../types";
import { firstText } from "../utils";

export const extractWorkdayJob: JobExtractor = (document) => ({
  company: firstText(document, ["[data-automation-id='header-title']", "[data-automation-id='jobPostingCompany']"]),
  title: firstText(document, ["[data-automation-id='jobPostingHeader']", "[data-automation-id='jobPostingTitle']"]),
  salary: firstText(document, ["[data-automation-id='jobPostingSalary']", "[data-automation-id*='salary']"]),
  location: firstText(document, ["[data-automation-id='jobPostingLocation']", "[data-automation-id*='location']"]),
});
