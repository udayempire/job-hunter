export type JobShareDetails = {
  company: string;
  title: string;
  location?: string;
  salary?: string;
};

function valueOrUndefined(value?: string) {
  if (!value || value === "Location not specified") return undefined;
  return value;
}

export function buildJobShareText(job: JobShareDetails) {
  const lines = [`${job.title} at ${job.company}`];
  const location = valueOrUndefined(job.location);
  const salary = valueOrUndefined(job.salary);

  if (location) lines.push(`Location: ${location}`);
  if (salary) lines.push(`Salary: ${salary}`);

  return lines.join("\n");
}

export function getJobShareDestinations(job: JobShareDetails, url: string) {
  const text = buildJobShareText(job);
  const message = `${text}\n\n${url}`;

  return {
    x: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
  };
}
