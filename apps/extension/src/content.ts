function firstText(selectors: string[]): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const text = element?.textContent?.trim();
    if (text) return text.replace(/\s+/g, " ");
  }
  return "";
}

function structuredJob(): { company?: string; title?: string; applyLink?: string } {
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
  for (const script of scripts) {
    try {
      const value = JSON.parse(script.textContent ?? "") as Record<string, unknown> | Array<Record<string, unknown>>;
      const candidates = Array.isArray(value) ? value : [value];
      const job = candidates.find((item) => item["@type"] === "JobPosting");
      if (!job) continue;
      const organization = job.hiringOrganization as Record<string, unknown> | undefined;
      return {
        company: typeof organization?.name === "string" ? organization.name : undefined,
        title: typeof job.title === "string" ? job.title : undefined,
        applyLink: typeof job.url === "string" ? job.url : undefined,
      };
    } catch {
      // Ignore malformed structured data and use normal page metadata.
    }
  }
  return {};
}

chrome.runtime.onMessage.addListener((message: { type?: string }, _sender, sendResponse) => {
  if (message.type !== "extract-job") return;

  const structured = structuredJob();
  const title = structured.title || firstText(["h1", "[data-testid*='job-title']", "[class*='job-title']"]);
  const company = structured.company || firstText(["[data-testid*='company']", "[class*='company-name']", "[class*='employer']"]);
  const applyElement = document.querySelector<HTMLAnchorElement>(
    "a[href*='apply' i], a[aria-label*='apply' i], button[aria-label*='apply' i]",
  );

  sendResponse({
    company,
    title,
    applyLink: structured.applyLink || applyElement?.href || location.href,
    detailsUrl: location.href,
    source: location.hostname,
  });
});
