"use client";

import { useRef, useState } from "react";
import { Icon } from "./icon";
import type { Job, JobDraft } from "./types";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#302a28] outline-none transition focus:border-[#9b6b4b] focus:ring-4 focus:ring-[#9b6b4b]/10";
const textAreaClass =
  "min-h-28 w-full resize-y rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-[#302a28] outline-none transition placeholder:text-[#aaa09a] focus:border-[#9b6b4b] focus:ring-4 focus:ring-[#9b6b4b]/10";

function FieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-[#6e6561]"
    >
      {children}{" "}
      {optional && (
        <span className="font-normal text-[#aaa09a]">(optional)</span>
      )}
    </label>
  );
}

function TextField({
  id,
  name,
  label,
  placeholder,
  type = "text",
  optional = true,
  defaultValue = "",
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  type?: "text" | "url";
  optional?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function TextAreaField({
  id,
  name,
  label,
  placeholder,
  className = textAreaClass,
  defaultValue = "",
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} optional>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
}

function value(form: FormData, name: string) {
  const entry = form.get(name);
  return typeof entry === "string" ? entry.trim() : "";
}

export function AddJobDialog({
  onAdd,
  initialJob,
  trigger,
}: {
  onAdd: (job: JobDraft) => Promise<void> | void;
  initialJob?: Job;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [recruiterCount, setRecruiterCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  async function addJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const company = value(form, "company");
    const title = value(form, "title");
    const applyLink = value(form, "applyLink");

    if (!company || !title || !applyLink) {
      setError("Company, role title, and apply link are required.");
      return;
    }

    const recruiters = Array.from({ length: recruiterCount }, (_, index) => ({
      role: value(form, `recruiters.${index}.role`),
      email: value(form, `recruiters.${index}.email`),
      link: value(form, `recruiters.${index}.link`),
    })).filter(
      (recruiter) => recruiter.role || recruiter.email || recruiter.link,
    );

    await onAdd({
      company,
      title,
      applyLink,
      detailsUrl: value(form, "detailsUrl") || undefined,
      description: value(form, "description") || undefined,
      salary: value(form, "salary") || undefined,
      location: value(form, "location") || undefined,
      companyWebsite: value(form, "companyWebsite") || undefined,
      companyLinkedin: value(form, "companyLinkedin") || undefined,
      companyX: value(form, "companyX") || undefined,
      personalNotes: value(form, "personalNotes") || undefined,
      recruiters,
      visibility: value(form, "visibility") as JobDraft["visibility"],
    });
    formRef.current?.reset();
    setRecruiterCount(0);
    setError("");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRecruiterCount(initialJob?.recruiters?.length ?? 0);
          setOpen(true);
        }}
        className={
          trigger
            ? undefined
            : "inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#292323] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#463d3b]"
        }
      >
        {trigger ?? (
          <>
            <Icon name="plus" size={16} /> Add Job
          </>
        )}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#211b1b]/30 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-job-title"
        >
          <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-black/10 bg-[#fffdf9] p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">
                  Capture opportunity
                </p>
                <h2
                  id="add-job-title"
                  className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#292323]"
                >
                  Add a job to review
                </h2>
                <p className="mt-2 text-sm text-[#8b817b]">
                  Start with the essentials. Add context when it helps you
                  decide later.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-2 py-1 text-xl text-[#827873] hover:bg-black/5"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form ref={formRef} onSubmit={addJob} className="mt-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  id="job-company"
                  name="company"
                  label="Company"
                  placeholder="e.g. Orbit Labs"
                  optional={false}
                  defaultValue={initialJob?.company}
                />
                <TextField
                  id="job-title"
                  name="title"
                  label="Role title"
                  placeholder="e.g. Applied AI Engineer"
                  optional={false}
                  defaultValue={initialJob?.title}
                />
              </div>
              <div className="mt-3">
                <TextField
                  id="job-apply-link"
                  name="applyLink"
                  label="Apply link"
                  type="url"
                  placeholder="https://company.com/apply/…"
                  optional={false}
                  defaultValue={initialJob?.applyLink ?? initialJob?.url}
                />
              </div>
              <div className="mt-3">
                <TextField
                  id="job-details-url"
                  name="detailsUrl"
                  label="Job details URL"
                  type="url"
                  placeholder="https://company.com/jobs/…"
                  defaultValue={initialJob?.detailsUrl}
                />
              </div>
              <div className="mt-3">
                <TextAreaField
                  id="job-description"
                  name="description"
                  label="Job description"
                  placeholder="Paste the job description…"
                  defaultValue={initialJob?.summary}
                />
              </div>

              <div className="my-6 border-t border-black/8" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b4b]">
                Helpful context
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <TextField
                  id="job-salary"
                  name="salary"
                  label="Salary"
                  placeholder="e.g. ₹12–18 LPA"
                  defaultValue={initialJob?.salary}
                />
                <TextField
                  id="job-location"
                  name="location"
                  label="Location"
                  placeholder="e.g. Bengaluru · Remote"
                  defaultValue={initialJob?.location}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <TextField
                  id="job-company-website"
                  name="companyWebsite"
                  label="Company website"
                  type="url"
                  placeholder="https://company.com"
                  defaultValue={initialJob?.companyWebsite}
                />
                <TextField
                  id="job-company-linkedin"
                  name="companyLinkedin"
                  label="Company LinkedIn"
                  type="url"
                  placeholder="https://linkedin.com/company/…"
                  defaultValue={initialJob?.companyLinkedin}
                />
              </div>
              <div className="mt-3">
                <TextField
                  id="job-company-x"
                  name="companyX"
                  label="Company X"
                  type="url"
                  placeholder="https://x.com/company"
                  defaultValue={initialJob?.companyX}
                />
              </div>
              <div className="mt-3">
                <TextAreaField
                  id="job-personal-notes"
                  name="personalNotes"
                  label="Personal notes"
                  placeholder="Only you will see these notes…"
                  defaultValue={initialJob?.personalNotes}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-[#f7f2ed] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#403733]">
                      Recruiter contacts
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#8b817b]">
                      Add a role, email, or link for each recruiter.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecruiterCount((count) => count + 1)}
                    className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#6d4d3a] shadow-sm transition hover:bg-[#fffaf5]"
                  >
                    + Add contact
                  </button>
                </div>
                {recruiterCount > 0 && (
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: recruiterCount }, (_, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-black/8 bg-white p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-[#817773]">
                            Recruiter {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setRecruiterCount((count) => count - 1)
                            }
                            className="text-xs text-[#a05c5c] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                          <input
                            name={`recruiters.${index}.role`}
                            defaultValue={initialJob?.recruiters?.[index]?.role}
                            placeholder="Role"
                            className={inputClass}
                          />
                          <input
                            name={`recruiters.${index}.email`}
                            type="email"
                            defaultValue={
                              initialJob?.recruiters?.[index]?.email
                            }
                            placeholder="Email"
                            className={inputClass}
                          />
                          <input
                            name={`recruiters.${index}.link`}
                            type="url"
                            defaultValue={initialJob?.recruiters?.[index]?.link}
                            placeholder="Profile link"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5">
                <FieldLabel htmlFor="job-visibility">
                  Profile visibility
                </FieldLabel>
                <select
                  id="job-visibility"
                  name="visibility"
                  defaultValue={initialJob?.visibility ?? "PRIVATE"}
                  className={inputClass}
                >
                  <option value="PRIVATE">
                    Private · not shown on my profile
                  </option>
                  <option value="PROFILE">Public · shown on my profile</option>
                </select>
                <p className="mt-2 text-xs text-[#8b817b]">
                  You can share this job separately with the share button.
                </p>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-[#6e6561] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#292323] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#463d3b]"
                >
                  Save job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
