import type { JobExtractor } from "./types";
import { firstLink, firstText, normalizeSalary, normalizeText } from "./utils";

function websiteFromButton(document: Document): string | undefined {
  const button = document.querySelector<HTMLButtonElement>("button[class*='websiteLink']");
  const value = normalizeText(button?.textContent);
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function salaryBeforeEquity(document: Document): string | undefined {
  const value = firstText(document, [
    "[data-test*='salary']",
    "[class*='salary']",
    "[class*='compensation']",
    "[class*='subheader']",
  ]);
  if (!value) return undefined;
  return normalizeSalary(normalizeText(value.split("•")[0]));
}

function labeledDefinitionValue(document: Document, label: string): string | undefined {
  for (const definition of document.querySelectorAll("aside [data-test='Sidebar'] dd, aside dd")) {
    if (normalizeText(definition.textContent).toLowerCase() !== label.toLowerCase()) continue;
    const value = definition.nextElementSibling;
    if (!value) continue;

    const items = [...value.querySelectorAll("li")]
      .map((item) => normalizeText(item.textContent))
      .filter(Boolean);
    return items.length ? items.join(", ") : normalizeText(value.textContent);
  }
  return undefined;
}

export const extractWellfoundJob: JobExtractor = (document) => ({
  company: firstText(document, [
    "a[href^='/company/'] span",
    "a[href*='/company/']",
    "[data-test='StartupName']",
    "[class*='company-name']",
  ]),
  title: firstText(document, [
    "h1",
    "[data-test='JobTitle']",
    "[class*='job-title']",
  ]),
  salary: salaryBeforeEquity(document),
  location: labeledDefinitionValue(document, "Locations") || firstText(document, [
    "[data-test*='location']",
    "[class*='location']",
  ]),
  companyWebsite: firstLink(document, [
    "a[href^='http'][aria-label*='website' i]",
    "a[href^='http'][title*='website' i]",
  ]) || websiteFromButton(document),
});
