import express, { type Request, type Response, type Router } from "express";
import { db, JobStatus, JobVisibility, Prisma } from "@repo/db";
import { requireAuth, type AuthenticatedRequest } from "../auth/require-auth.js";

const jobRouter: Router = express.Router();
jobRouter.use(requireAuth);

const jobStatuses = new Set(Object.values(JobStatus));
const jobVisibilities = new Set(Object.values(JobVisibility));

function stringValue(value: unknown): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined;
}

function statusValue(value: unknown): JobStatus | undefined {
  const status = stringValue(value)?.toUpperCase();
  return status && jobStatuses.has(status as JobStatus) ? (status as JobStatus) : undefined;
}

function visibilityValue(value: unknown): JobVisibility | undefined {
  const visibility = stringValue(value)?.toUpperCase();
  return visibility && jobVisibilities.has(visibility as JobVisibility) ? visibility as JobVisibility : undefined;
}

function paginationValue(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? Math.min(parsed, max) : fallback;
}

jobRouter.get("/", async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const status = statusValue(request.query.status);
  const search = stringValue(request.query.search);
  const skip = paginationValue(request.query.skip, 0, 10_000);
  const take = paginationValue(request.query.take, 20, 100);

  const jobs = await db.job.findMany({
    where: {
      ownerId: userId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { company: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: { recruiters: true },
  });

  response.json({ data: jobs, pagination: { skip, take, count: jobs.length } });
});

jobRouter.get("/:id", async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const id = stringValue(request.params.id);
  if (!id) {
    response.status(400).json({ error: "Job id is required" });
    return;
  }
  const job = await db.job.findUnique({
    where: { id, ownerId: userId },
    include: { applications: true, recruiters: true },
  });

  if (!job) {
    response.status(404).json({ error: "Job not found" });
    return;
  }

  response.json({ data: job });
});

jobRouter.post("/", async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const company = stringValue(request.body.company);
  const title = stringValue(request.body.title);
  const applyLink = stringValue(request.body.applyLink);
  const detailsUrl = stringValue(request.body.detailsUrl ?? request.body.url);
  const description = stringValue(request.body.description);

  if (!company || !title || !applyLink) {
    response.status(400).json({
      error: "company, title, and applyLink are required",
    });
    return;
  }

  try {
    const job = await db.job.create({
      data: {
        company,
        title,
        owner: { connect: { id: userId } },
        applyLink,
        url: detailsUrl,
        description,
        source: stringValue(request.body.source),
        location: stringValue(request.body.location),
        salary: stringValue(request.body.salary),
        companyWebsite: stringValue(request.body.companyWebsite),
        companyLinkedin: stringValue(request.body.companyLinkedin),
        companyX: stringValue(request.body.companyX),
        personalNotes: stringValue(request.body.personalNotes),
        requirements: request.body.requirements,
        resumeVersion: stringValue(request.body.resumeVersion),
        recruiters: { create: recruiterContacts(request.body.recruiters) },
        visibility: visibilityValue(request.body.visibility) ?? JobVisibility.PRIVATE,
      },
    });

    response.status(201).json({ data: job });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      response.status(409).json({ error: "A job with this URL already exists" });
      return;
    }

    response.status(500).json({ error: "Failed to create job" });
  }
});

jobRouter.patch("/:id", async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const id = stringValue(request.params.id);
  if (!id) {
    response.status(400).json({ error: "Job id is required" });
    return;
  }
  const data: Prisma.JobUpdateInput = {};
  const textFields = ["company", "title", "applyLink", "url", "source", "location", "salary", "companyWebsite", "companyLinkedin", "companyX", "description", "personalNotes", "matchReason", "resumeVersion"];

  for (const field of textFields) {
    if (field in request.body) {
      const value = stringValue(request.body[field]);
      if (!value) {
        response.status(400).json({ error: `${field} cannot be empty` });
        return;
      }
      (data as Record<string, unknown>)[field] = value;
    }
  }

  for (const field of ["requirements", "missingSkills"]) {
    if (field in request.body) {
      (data as Record<string, unknown>)[field] = request.body[field];
    }
  }

  if ("recruiters" in request.body) {
    (data as Record<string, unknown>).recruiters = {
      deleteMany: {},
      create: recruiterContacts(request.body.recruiters),
    };
  }

  if ("fitScore" in request.body) {
    const fitScore = Number(request.body.fitScore);
    if (!Number.isInteger(fitScore) || fitScore < 0 || fitScore > 100) {
      response.status(400).json({ error: "fitScore must be an integer from 0 to 100" });
      return;
    }
    data.fitScore = fitScore;
  }

  if ("status" in request.body) {
    const status = statusValue(request.body.status);
    if (!status) {
      response.status(400).json({ error: `status must be one of: ${[...jobStatuses].join(", ")}` });
      return;
    }
    data.status = status;
  }

  if ("visibility" in request.body) {
    const visibility = visibilityValue(request.body.visibility);
    if (!visibility) {
      response.status(400).json({ error: `visibility must be one of: ${[...jobVisibilities].join(", ")}` });
      return;
    }
    data.visibility = visibility;
  }

  if (!Object.keys(data).length) {
    response.status(400).json({ error: "No valid fields to update" });
    return;
  }

  try {
    const ownedJob = await db.job.findFirst({ where: { id, ownerId: userId }, select: { id: true } });
    if (!ownedJob) {
      response.status(404).json({ error: "Job not found" });
      return;
    }
    const job = await db.job.update({ where: { id }, data });
    response.json({ data: job });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      response.status(404).json({ error: "Job not found" });
      return;
    }
    if (isUniqueConstraintError(error)) {
      response.status(409).json({ error: "A job with this URL already exists" });
      return;
    }
    response.status(500).json({ error: "Failed to update job" });
  }
});

jobRouter.delete("/:id", async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const id = stringValue(request.params.id);
  if (!id) {
    response.status(400).json({ error: "Job id is required" });
    return;
  }
  try {
    const ownedJob = await db.job.findFirst({ where: { id, ownerId: userId }, select: { id: true } });
    if (!ownedJob) {
      response.status(404).json({ error: "Job not found" });
      return;
    }
    await db.job.delete({ where: { id } });
    response.status(204).send();
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      response.status(404).json({ error: "Job not found" });
      return;
    }
    response.status(500).json({ error: "Failed to delete job" });
  }
});

function isUniqueConstraintError(error: unknown): boolean {
  return isPrismaError(error, "P2002");
}

function isRecordNotFoundError(error: unknown): boolean {
  return isPrismaError(error, "P2025");
}

function isPrismaError(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function recruiterContacts(value: unknown): Array<{ role?: string; email?: string; link?: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter((contact): contact is Record<string, unknown> => typeof contact === "object" && contact !== null)
    .map((contact) => ({
      role: stringValue(contact.role),
      email: stringValue(contact.email),
      link: stringValue(contact.link),
    }))
    .filter((contact) => contact.role || contact.email || contact.link);
}

export default jobRouter;
