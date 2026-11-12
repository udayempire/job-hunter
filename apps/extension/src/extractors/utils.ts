import type { ExtractedJob } from "./types";

export function normalizeText(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function formatSalaryAmount(value: string, hasThousandsSuffix: boolean): string {
  const amount = Number(value.replace(/,/g, ""));
  if (hasThousandsSuffix && amount < 1000) return `${value}K`;
  if (!Number.isFinite(amount) || amount < 1000) return value;
  const compact = (amount / 1000).toFixed(1).replace(/\.0$/, "");
  return `${compact}K`;
}

export function normalizeSalary(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = normalizeText(value).replace(/,/g, "");
  const numbers = normalized.match(/\d+(?:\.\d+)?/g);
  if (!numbers?.length || numbers.length > 2) return normalizeText(value);
  const hasThousandsSuffix = /\d(?:\.\d+)?\s*[Kk]\b/.test(normalized);
  const lakhNumbers = normalized.match(/\d+(?:\.\d+)?(?=\s*[Ll]\b)/g);
  const rawCurrency = normalized.match(/(?:USD|INR|EUR|GBP|AUD|CAD|SGD|AED|Rs\.?|\$|₹|€|£)/i)?.[0];
  const currencyMap: Record<string, string> = { "$": "USD", "₹": "INR", "€": "EUR", "£": "GBP" };
  const currency = rawCurrency
    ? (currencyMap[rawCurrency] ?? rawCurrency.replace(".", "").toUpperCase())
    : "";
  if (lakhNumbers?.length && lakhNumbers.length <= 2) {
    const range = lakhNumbers.map((number) => `${number}L`).join("-");
    return currency ? `${range} ${currency}` : range;
  }
  const range = numbers.map((number) => formatSalaryAmount(number, hasThousandsSuffix)).join("-");
  return currency ? `${range} ${currency}` : range;
}

export function firstText(document: ParentNode, selectors: string[]): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const text = normalizeText(element?.textContent);
    if (text) return text;
  }
  return "";
}

export function firstLink(document: Document, selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const element = document.querySelector<HTMLAnchorElement>(selector);
    if (element?.href && /^https?:$/.test(new URL(element.href).protocol)) return element.href;
  }
  return undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? normalizeText(value) : undefined;
}

function structuredLocation(value: unknown): string | undefined {
  if (typeof value === "string") return stringValue(value);
  if (!value || typeof value !== "object") return undefined;
  const location = value as Record<string, unknown>;
  const address = location.address && typeof location.address === "object"
    ? location.address as Record<string, unknown>
    : location;
  const parts = [address.streetAddress, address.addressLocality, address.addressRegion, address.postalCode, address.addressCountry]
    .map(stringValue).filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

function structuredSalary(value: unknown): string | undefined {
  if (typeof value === "string") return normalizeSalary(stringValue(value));
  if (!value || typeof value !== "object") return undefined;
  const salary = value as Record<string, unknown>;
  const currency = stringValue(salary.currency);
  const amount = salary.value && typeof salary.value === "object" ? salary.value as Record<string, unknown> : salary;
  const min = amount.minValue ?? amount.value;
  const max = amount.maxValue;
  const values = [min, max].filter((entry) => typeof entry === "number" || typeof entry === "string").map(String);
  if (!values.length) return undefined;
  const range = values.length > 1 && values[0] !== values[1] ? `${values[0]}–${values[1]}` : values[0];
  return normalizeSalary(currency ? `${range} ${currency}` : range);
}

function jobPosting(value: Record<string, unknown>): ExtractedJob | undefined {
  if (value["@type"] !== "JobPosting") return undefined;
  const organization = value.hiringOrganization as Record<string, unknown> | undefined;
  const sameAs = Array.isArray(organization?.sameAs) ? organization.sameAs : [];
  const socialLinks = sameAs.filter((entry): entry is string => typeof entry === "string");
  return {
    company: stringValue(organization?.name),
    title: stringValue(value.title),
    salary: structuredSalary(value.baseSalary ?? value.salary),
    location: structuredLocation(value.jobLocation ?? value.location),
    companyWebsite: stringValue(organization?.url),
    companyLinkedin: socialLinks.find((link) => /linkedin\.com/i.test(link)),
    companyX: socialLinks.find((link) => /(?:x|twitter)\.com/i.test(link)),
  };
}

export function structuredJob(document: Document): ExtractedJob {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const value = JSON.parse(script.textContent ?? "") as Record<string, unknown> | Array<Record<string, unknown>>;
      const candidates = Array.isArray(value)
        ? value
        : Array.isArray(value["@graph"])
          ? value["@graph"] as Array<Record<string, unknown>>
          : [value];
      const job = candidates.map(jobPosting).find(Boolean);
      if (job) return job;
    } catch {
      // Ignore malformed structured data and continue with selectors.
    }
  }
  return {};
}

export function mergeExtractedJobs(...jobs: ExtractedJob[]): ExtractedJob {
  const merged = jobs.reduce<ExtractedJob>((result, job) => {
    for (const [key, value] of Object.entries(job) as Array<[keyof ExtractedJob, string | undefined]>) {
      if (value) result[key] = value;
    }
    return result;
  }, {});
  merged.salary = normalizeSalary(merged.salary);
  return merged;
}
