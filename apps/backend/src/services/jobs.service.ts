import { db, JobStatus, JobVisibility, Prisma } from "@repo/db";

export class JobServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "JobServiceError";
  }
}

export type JobListInput = {
  status?: unknown;
  search?: unknown;
  skip?: unknown;
  take?: unknown;
};

type UpdateJobOptions = {
  appendRecruiters?: boolean;
  markEnriched?: boolean;
};

export async function listJobs(userId: string, input: JobListInput) {
  const status = statusValue(input.status);
  const search = stringValue(input.search);
  const skip = paginationValue(input.skip, 0, 10_000);
  const take = paginationValue(input.take, 20, 100);

  const jobs = await db.job.findMany({
    where: {
      ownerId: userId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { company: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: { recruiters: true },
  });

  return { jobs, pagination: { skip, take, count: jobs.length } };
}

export async function getJob(userId: string, idValue: unknown) {
  const id = requiredId(idValue);
  const job = await db.job.findUnique({
    where: { id, ownerId: userId },
    include: { recruiters: true },
  });

  if (!job) throw new JobServiceError("Job not found", 404);
  return job;
}

export async function createJob(userId: string, input: Record<string, unknown>) {
  const providedCompany = stringValue(input.company);
  const company = providedCompany ?? "Unnamed company";
  const title = stringValue(input.title);
  const applyLink = stringValue(input.applyLink);
  const detailsUrl = stringValue(input.detailsUrl ?? input.url);
  const description = stringValue(input.description);

  if (!applyLink && !detailsUrl) {
    throw new JobServiceError("applyLink or detailsUrl is required", 400);
  }

  try {
    return await db.job.create({
      data: {
        company,
        owner: { connect: { id: userId } },
        applyLink,
        url: detailsUrl ?? applyLink,
        description,
        source: stringValue(input.source),
        location: stringValue(input.location),
        salary: stringValue(input.salary),
        companyWebsite: stringValue(input.companyWebsite),
        companyLinkedin: stringValue(input.companyLinkedin),
        companyX: stringValue(input.companyX),
        personalNotes: stringValue(input.personalNotes),
        requirements: jsonValue(input.requirements),
        resumeVersion: stringValue(input.resumeVersion),
        recruiters: { create: recruiterContacts(input.recruiters) },
        visibility: visibilityValue(input.visibility) ?? JobVisibility.PRIVATE,
        ...(title && providedCompany
          ? { title }
          : { title: title ?? null, status: JobStatus.REVIEW }),
      },
      include: { recruiters: true },
    });
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      const duplicateUrl = detailsUrl ?? applyLink;
      const existingJob = duplicateUrl
        ? await db.job.findFirst({
            where: {
              ownerId: userId,
              OR: [{ url: duplicateUrl }, { applyLink: duplicateUrl }],
            },
            select: { id: true },
          })
        : null;
      throw new JobServiceError(
        "A job with this URL already exists",
        409,
        existingJob ? { id: existingJob.id } : undefined,
      );
    }
    throw error;
  }
}

export async function updateJob(
  userId: string,
  idValue: unknown,
  input: Record<string, unknown>,
  options: UpdateJobOptions = {},
) {
  const id = requiredId(idValue);
  const data: Prisma.JobUpdateInput = {};
  const normalizedInput = { ...input };
  if ("detailsUrl" in normalizedInput && !("url" in normalizedInput)) {
    normalizedInput.url = normalizedInput.detailsUrl;
  }

  const textFields = [
    "company",
    "title",
    "applyLink",
    "url",
    "source",
    "location",
    "salary",
    "companyWebsite",
    "companyLinkedin",
    "companyX",
    "description",
    "personalNotes",
    "matchReason",
    "resumeVersion",
  ] as const;

  for (const field of textFields) {
    if (field in normalizedInput) {
      (data as Record<string, unknown>)[field] = nullableString(normalizedInput[field]);
    }
  }

  for (const field of ["requirements", "missingSkills", "researchSources"] as const) {
    if (field in normalizedInput) {
      (data as Record<string, unknown>)[field] = jsonValue(normalizedInput[field]);
    }
  }

  if ("recruiters" in normalizedInput) {
    const recruiters = recruiterContacts(normalizedInput.recruiters);
    if (options.appendRecruiters) {
      const newRecruiters = recruiters.filter((contact) => !contact.id);
      const existingRecruiters = recruiters.filter(
        (contact): contact is typeof contact & { id: string } => Boolean(contact.id),
      );
      (data as Record<string, unknown>).recruiters = {
        create: newRecruiters.map(({ id: _id, ...contact }) => contact),
        updateMany: existingRecruiters.map(({ id, ...contact }) => ({
          where: { id },
          data: contact,
        })),
      };
    } else {
      (data as Record<string, unknown>).recruiters = {
        deleteMany: {},
        create: recruiters.map(({ id: _id, ...contact }) => contact),
      };
    }
  }

  if ("fitScore" in normalizedInput) {
    const fitScore = Number(normalizedInput.fitScore);
    if (!Number.isInteger(fitScore) || fitScore < 0 || fitScore > 100) {
      throw new JobServiceError("fitScore must be an integer from 0 to 100", 400);
    }
    data.fitScore = fitScore;
  }

  if ("status" in normalizedInput) {
    const status = statusValue(normalizedInput.status);
    if (!status) {
      throw new JobServiceError(
        `status must be one of: ${Object.values(JobStatus).join(", ")}`,
        400,
      );
    }
    data.status = status;
  }

  if ("visibility" in normalizedInput) {
    const visibility = visibilityValue(normalizedInput.visibility);
    if (!visibility) {
      throw new JobServiceError(
        `visibility must be one of: ${Object.values(JobVisibility).join(", ")}`,
        400,
      );
    }
    data.visibility = visibility;
  }

  if (options.markEnriched) data.lastEnrichedAt = new Date();

  if (!Object.keys(data).length) {
    throw new JobServiceError("No valid fields to update", 400);
  }

  const ownedJob = await db.job.findFirst({
    where: { id, ownerId: userId },
    select: { id: true },
  });
  if (!ownedJob) throw new JobServiceError("Job not found", 404);

  try {
    return await db.job.update({
      where: { id },
      data,
      include: { recruiters: true },
    });
  } catch (error) {
    if (isPrismaError(error, "P2025")) {
      throw new JobServiceError("Job not found", 404);
    }
    if (isPrismaError(error, "P2002")) {
      throw new JobServiceError("A job with this URL already exists", 409);
    }
    throw error;
  }
}

export function enrichJob(
  userId: string,
  idValue: unknown,
  changes: Record<string, unknown>,
) {
  return updateJob(userId, idValue, changes, {
    appendRecruiters: true,
    markEnriched: true,
  });
}

export async function deleteJob(userId: string, idValue: unknown) {
  const id = requiredId(idValue);
  await db.job.deleteMany({ where: { id, ownerId: userId } });
}

function requiredId(value: unknown) {
  const id = stringValue(value);
  if (!id) throw new JobServiceError("Job id is required", 400);
  return id;
}

function stringValue(value: unknown): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : undefined;
}

function nullableString(value: unknown): string | null {
  return stringValue(value) ?? null;
}

function statusValue(value: unknown): JobStatus | undefined {
  const status = stringValue(value)?.toUpperCase();
  return status && Object.values(JobStatus).includes(status as JobStatus)
    ? (status as JobStatus)
    : undefined;
}

function visibilityValue(value: unknown): JobVisibility | undefined {
  const visibility = stringValue(value)?.toUpperCase();
  return visibility && Object.values(JobVisibility).includes(visibility as JobVisibility)
    ? (visibility as JobVisibility)
    : undefined;
}

function paginationValue(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? Math.min(parsed, max) : fallback;
}

function jsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

function recruiterContacts(value: unknown): Array<{
  id?: string;
  name?: string;
  role?: string;
  email?: string;
  link?: string;
  sourceUrl?: string;
  notes?: string;
  verificationStatus?: "UNVERIFIED" | "VERIFIED";
}> {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (contact): contact is Record<string, unknown> =>
        typeof contact === "object" && contact !== null,
    )
    .map((contact) => ({
      id: stringValue(contact.id),
      name: stringValue(contact.name),
      role: stringValue(contact.role),
      email: stringValue(contact.email),
      link: stringValue(contact.profileLink ?? contact.link),
      sourceUrl: stringValue(contact.sourceUrl),
      notes: stringValue(contact.notes),
      verificationStatus:
        stringValue(contact.verificationStatus)?.toUpperCase() === "VERIFIED"
          ? ("VERIFIED" as const)
          : ("UNVERIFIED" as const),
    }))
    .filter(
      (contact) =>
        contact.id ||
        contact.name ||
        contact.role ||
        contact.email ||
        contact.link,
    );
}

function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}
