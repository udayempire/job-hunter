import type { JobExtractor } from "../types";
import { firstText } from "../utils";

export const extractLeverJob: JobExtractor = (document) => ({
  company: firstText(document, [".posting-headline .company", ".main-header-logo img"]),
  title: firstText(document, [".posting-headline h2", ".posting-headline h1"]),
  salary: firstText(document, [".posting-categories .salary", "[class*='salary']"]),
  location: firstText(document, [".posting-categories .location", ".posting-categories"]),
});
