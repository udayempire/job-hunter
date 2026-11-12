import type { JobExtractor } from "../types";
import { firstText } from "../utils";

export const extractGreenhouseJob: JobExtractor = (document) => ({
  company: firstText(document, ["#header .company-name", ".company-name"]),
  title: firstText(document, [".app-title", ".job__title", "h1"]),
  salary: firstText(document, [".salary", "[class*='salary']"]),
  location: firstText(document, [".location", ".job-location"]),
});
