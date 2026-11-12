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

const platformLinkedInSlugs = new Set([
  "glassdoor",
  "indeed",
  "naukri",
  "naukri-com",
  "wellfound",
  "angel-list",
  "y-combinator",
  "unstop",
  "greenhouse",
  "lever",
  "workday",
]);
const platformXHandles = new Set([
  "glassdoor",
  "indeed",
  "naukri",
  "wellfound",
  "ycombinator",
  "unstop",
  "greenhouse",
  "lever",
  "workday",
]);

function removePlatformSocialLinks(job: ExtractedJob): void {
  if (!job.companyLinkedin) return;

  try {
    const socialUrl = new URL(job.companyLinkedin);
    const socialHost = socialUrl.hostname.toLowerCase();
    const segments = socialUrl.pathname.split("/").filter(Boolean).map((segment) => segment.toLowerCase());
    const companySlug = segments[0] === "company" ? segments[1] : undefined;
    const xHandle = segments[0];

    if ((socialHost === "linkedin.com" || socialHost === "www.linkedin.com") && companySlug && platformLinkedInSlugs.has(companySlug)) {
      job.companyLinkedin = undefined;
    }
    if ((socialHost === "x.com" || socialHost === "www.x.com" || socialHost === "twitter.com" || socialHost === "www.twitter.com") && xHandle && platformXHandles.has(xHandle)) {
      job.companyX = undefined;
    }
  } catch {
    // Ignore malformed optional social links.
  }
}

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
  if (host === "glassdoor.com" || host.endsWith(".glassdoor.com") || host === "glassdoor.co.in" || host.endsWith(".glassdoor.co.in")) return extractGlassdoorJob;
  return undefined;
}

export function extractJob(document: Document, hostname: string): ExtractedJob {
  const host = hostname.toLowerCase();
  const isGlassdoor = host === "glassdoor.com" || host.endsWith(".glassdoor.com") || host === "glassdoor.co.in" || host.endsWith(".glassdoor.co.in");
  if (isGlassdoor && !document.querySelector("[data-test='job-details-header']")) return {};

  const site = siteExtractor(hostname);
  const extracted = mergeExtractedJobs(extractGenericJob(document), site ? site(document) : {});

  if (hostname.toLowerCase().endsWith("ycombinator.com") && extracted.companyX) {
    try {
      const socialUrl = new URL(extracted.companyX);
      const socialHost = socialUrl.hostname.toLowerCase();
      const socialPath = socialUrl.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
      if ((socialHost === "x.com" || socialHost === "twitter.com") && socialPath === "ycombinator") {
        extracted.companyX = undefined;
      }
    } catch {
      // Ignore malformed optional social links.
    }
  }

  if (hostname.toLowerCase().endsWith("naukri.com")) {
    extracted.companyLinkedin = undefined;
    extracted.companyX = undefined;
  }

  removePlatformSocialLinks(extracted);

  return extracted;
}
