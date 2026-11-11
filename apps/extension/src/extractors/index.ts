import { extractGenericJob } from "./generic";
import { extractGreenhouseJob } from "./greenhouse";
import { extractGlassdoorJob } from "./glassdoor";
import { extractIndeedJob } from "./indeed";
import { extractLeverJob } from "./lever";
import { extractLinkedInJob } from "./linkedin";
import { extractNaukriJob } from "./naukri";
import type { ExtractedJob, JobExtractor } from "./types";
import { extractWorkdayJob } from "./workday";
import { extractWellfoundJob } from "./wellfound";
import { extractYCombinatorJob } from "./ycombinator";
import { extractUnstopJob } from "./unstop";
import { mergeExtractedJobs } from "./utils";

function siteExtractor(hostname: string): JobExtractor | undefined {
  const host = hostname.toLowerCase();
  if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return extractLinkedInJob;
  if (host === "indeed.com" || host.endsWith(".indeed.com")) return extractIndeedJob;
  if (host === "greenhouse.io" || host.endsWith(".greenhouse.io")) return extractGreenhouseJob;
  if (host === "lever.co" || host.endsWith(".lever.co")) return extractLeverJob;
  if (host === "myworkdayjobs.com" || host.endsWith(".myworkdayjobs.com")) return extractWorkdayJob;
  if (host === "ycombinator.com" || host.endsWith(".ycombinator.com")) return extractYCombinatorJob;
  if (host === "wellfound.com" || host.endsWith(".wellfound.com")) return extractWellfoundJob;
  if (host === "naukri.com" || host.endsWith(".naukri.com")) return extractNaukriJob;
  if (host === "unstop.com" || host.endsWith(".unstop.com")) return extractUnstopJob;
  if (host === "glassdoor.com" || host.endsWith(".glassdoor.com")) return extractGlassdoorJob;
  return undefined;
}

export function extractJob(document: Document, hostname: string): ExtractedJob {
  const site = siteExtractor(hostname);
  return mergeExtractedJobs(extractGenericJob(document), site ? site(document) : {});
}
