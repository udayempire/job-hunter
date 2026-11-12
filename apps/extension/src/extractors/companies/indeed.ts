import type { JobExtractor } from "../types";
import { firstText, normalizeText } from "../utils";

function headerText(document: Document, selectors: string[]): string {
  const header = document.querySelector("[data-testid='desktop-job-header']");
  return header ? firstText(header, selectors) : "";
}

function headerLocation(document: Document): string {
  const metadata = document.querySelector("[data-testid='desktop-job-header'] [data-testid='company-info-metadata']");
  if (!metadata) return "";

  const company = normalizeText(metadata.querySelector("a[href*='/cmp/']")?.textContent)
    || normalizeText(metadata.querySelector("[data-testid='vj-company-name']")?.textContent);
  const leafText = [...metadata.querySelectorAll("div")]
    .filter((element) => element.children.length === 0)
    .map((element) => normalizeText(element.textContent))
    .filter(Boolean);

  return leafText.find((text) => text !== company
    && /\p{L}/u.test(text)
    && !/^\d+(?:\.\d+)?$/.test(text)
    && !/full-time|part-time|contract|temporary/i.test(text)) ?? "";
}

function headerSalary(document: Document): string {
  const header = document.querySelector("[data-testid='desktop-job-header']");
  if (!header) return "";

  const salaryText = [...header.querySelectorAll("div[dir='ltr'], [aria-label]")]
    .filter((element) => element.children.length === 0)
    .map((element) => normalizeText(element.textContent))
    .find((text) => /(?:\$|₹|€|£|\b(?:USD|INR|EUR|GBP)\b).*\d|\d.*(?:a month|a year|per hour|per week)/i.test(text));

  return salaryText ?? "";
}

export const extractIndeedJob: JobExtractor = (document) => ({
  company: headerText(document, [
    "[data-testid='company-info-metadata'] a[href*='/cmp/']",
    "[data-testid='vj-company-name']",
  ]),
  title: headerText(document, [
    "[data-testid='vj-job-title']",
    "[data-testid='jobsearch-JobInfoHeader-title']",
    ".jobsearch-JobInfoHeader-title",
  ]),
  salary: headerSalary(document),
  location: headerLocation(document),
});
