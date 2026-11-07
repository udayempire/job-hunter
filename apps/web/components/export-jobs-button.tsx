"use client";

import { Icon } from "./icon";
import type { Job, JobStatus } from "./types";

const columns = [
  "Job ID",
  "Company",
  "Role",
  "Location",
  "Salary",
  "Added on",
  "Status",
  // "Fit score",
  // "Tags",
  "Summary",
  "Apply link",
  "Job details URL",
  "Company website",
  "Company LinkedIn",
  "Company X",
  // "Personal notes",
  "Recruiters",
  // "Visibility",
] as const;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cell(value: string) {
  return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function spreadsheetXml(jobs: Job[]) {
  const rows = jobs
    .map((job) => {
      const location =
        job.location === "Location not specified" ? "-" : job.location || "-";
      const recruiters = (job.recruiters ?? [])
        .map((recruiter) =>
          [recruiter.role, recruiter.email, recruiter.link]
            .filter(Boolean)
            .join(" · "),
        )
        .filter(Boolean)
        .join(" | ");
      return `<Row>${[
        job.id,
        job.company,
        job.title,
        location,
        job.salary || "-",
        job.age || "-",
        job.status,
        // String(job.score),
        // job.tags.join(", ") || "-",
        job.summary || "-",
        job.applyLink || "-",
        job.detailsUrl || job.url || "-",
        job.companyWebsite || "-",
        job.companyLinkedin || "-",
        job.companyX || "-",
        // job.personalNotes || "-",
        recruiters || "-",
        // job.visibility || "-",
      ]
        .map(cell)
        .join("")}</Row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Jobs">
  <Table>
   <Row>${columns.map(cell).join("")}</Row>
   ${rows}
  </Table>
 </Worksheet>
</Workbook>`;
}

export function ExportJobsButton({
  jobs,
  filter,
}: {
  jobs: Job[];
  filter: "All" | JobStatus;
}) {
  function exportJobs() {
    const blob = new Blob([spreadsheetXml(jobs)], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const exportName = filter.toLowerCase();
    link.href = url;
    link.download = `job-hunti-${exportName}-jobs.xls`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <button
      type="button"
      onClick={exportJobs}
      disabled={!jobs.length}
      className="inline-flex shrink-0 items-center gap-2 border border-[var(--gold-border)] bg-[var(--gold-surface)] px-3 py-2.5 text-sm font-semibold text-[var(--gold-ink)] transition hover:bg-[#483d1d] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon name="download" size={16} />
      Export
    </button>
  );
}
