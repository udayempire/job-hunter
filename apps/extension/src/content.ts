function firstText(selectors: string[]): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const text = element?.textContent?.trim();
    if (text) return text.replace(/\s+/g, " ");
  }
  return "";
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function structuredLocation(value: unknown): string | undefined {
  if (typeof value === "string") return stringValue(value);
  if (!value || typeof value !== "object") return undefined;

  const location = value as Record<string, unknown>;
  const address = location.address && typeof location.address === "object"
    ? location.address as Record<string, unknown>
    : location;
  const parts = [
    address.streetAddress,
    address.addressLocality,
    address.addressRegion,
    address.postalCode,
    address.addressCountry,
  ].map(stringValue).filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

function structuredSalary(value: unknown): string | undefined {
  if (typeof value === "string") return stringValue(value);
  if (!value || typeof value !== "object") return undefined;

  const salary = value as Record<string, unknown>;
  const currency = stringValue(salary.currency);
  const amount = salary.value && typeof salary.value === "object"
    ? salary.value as Record<string, unknown>
    : salary;
  const min = amount.minValue ?? amount.value;
  const max = amount.maxValue;
  const values = [min, max]
    .filter((entry) => typeof entry === "number" || typeof entry === "string")
    .map(String);
  if (!values.length) return undefined;
  const range = values.length > 1 && values[0] !== values[1]
    ? `${values[0]}–${values[1]}`
    : values[0];
  return currency ? `${currency} ${range}` : range;
}

function structuredJob(): { company?: string; title?: string; salary?: string; location?: string } {
  const scripts = [
    ...document.querySelectorAll('script[type="application/ld+json"]'),
  ];
  for (const script of scripts) {
    try {
      const value = JSON.parse(script.textContent ?? "") as
        Record<string, unknown> | Array<Record<string, unknown>>;
      const candidates = Array.isArray(value) ? value : [value];
      const job = candidates.find((item) => item["@type"] === "JobPosting");
      if (!job) continue;
      const organization = job.hiringOrganization as
        Record<string, unknown> | undefined;
      return {
        company:
          typeof organization?.name === "string"
            ? organization.name
            : undefined,
        title: typeof job.title === "string" ? job.title : undefined,
        salary: structuredSalary(job.baseSalary ?? job.salary),
        location: structuredLocation(job.jobLocation ?? job.location),
      };
    } catch {
      // Ignore malformed structured data and use normal page metadata.
    }
  }
  return {};
}

chrome.runtime.onMessage.addListener(
  (message: { type?: string }, _sender, sendResponse) => {
    if (message.type === "get-selection") {
      sendResponse({
        selection:
          window
            .getSelection()
            ?.toString()
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 200) ?? "",
      });
      return;
    }
    if (message.type !== "extract-job") return;

    const structured = structuredJob();
    const title =
      structured.title ||
      firstText(["h1", "[data-testid*='job-title']", "[class*='job-title']"]);
    const company =
      structured.company ||
      firstText([
        "[data-testid*='company']",
        "[class*='company-name']",
        "[class*='employer']",
      ]);
    const salary =
      structured.salary ||
      firstText([
        "[data-testid*='salary']",
        "[data-testid*='compensation']",
        "[class*='salary']",
        "[class*='compensation']",
      ]);
    const extractedLocation =
      structured.location ||
      firstText([
        "[data-testid*='location']",
        "[class*='job-location']",
        "[class*='location']",
      ]);
    const applyElement = [
      ...document.querySelectorAll<HTMLAnchorElement>("a[href]"),
    ].find((anchor) => {
      const hint = [
        anchor.textContent,
        anchor.getAttribute("aria-label"),
        anchor.getAttribute("title"),
        anchor.href,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        /\bapply\b/.test(hint) &&
        /^https?:$/.test(new URL(anchor.href).protocol)
      );
    });

    sendResponse({
      company,
      title,
      salary,
      location: extractedLocation,
      applyLink: applyElement?.href,
      detailsUrl: location.href,
      source: location.hostname,
    });
  },
);
