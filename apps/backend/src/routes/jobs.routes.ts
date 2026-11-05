import express, { type Request, type Response, type Router } from "express";
import { db, JobStatus, Prisma } from "@repo/db";

const jobRouter: Router = express.Router();

const jobStatuses = new Set(Object.values(JobStatus));

function stringValue(value: unknown): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined;
}

function statusValue(value: unknown): JobStatus | undefined {
  const status = stringValue(value)?.toUpperCase();
  return status && jobStatuses.has(status as JobStatus) ? (status as JobStatus) : undefined;
}

function paginationValue(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? Math.min(parsed, max) : fallback;
}

jobRouter.get("/", async (request: Request, response: Response) => {
  const status = statusValue(request.query.status);
  const search = stringValue(request.query.search);
  const skip = paginationValue(request.query.skip, 0, 10_000);
  const take = paginationValue(request.query.take, 20, 100);

  const jobs = await db.job.findMany({
    where: {
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
  });

  response.json({ data: jobs, pagination: { skip, take, count: jobs.length } });
});

jobRouter.get("/:id", async (request: Request, response: Response) => {
  const id = stringValue(request.params.id);
  if (!id) {
    response.status(400).json({ error: "Job id is required" });
    return;
  }
  const job = await db.job.findUnique({
    where: { id },
    include: { applications: true },
  });

  if (!job) {
    response.status(404).json({ error: "Job not found" });
    return;
  }

  response.json({ data: job });
});

jobRouter.post("/", async (request: Request, response: Response) => {
  const company = stringValue(request.body.company);
  const title = stringValue(request.body.title);
  const url = stringValue(request.body.url);
  const description = stringValue(request.body.description);

  if (!company || !title || !url || !description) {
    response.status(400).json({
      error: "company, title, url, and description are required",
    });
    return;
  }

  try {
    const job = await db.job.create({
      data: {
        company,
        title,
        url,
        description,
        source: stringValue(request.body.source),
        location: stringValue(request.body.location),
        requirements: request.body.requirements,
        resumeVersion: stringValue(request.body.resumeVersion),
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
  const id = stringValue(request.params.id);
  if (!id) {
    response.status(400).json({ error: "Job id is required" });
    return;
  }
  const data: Prisma.JobUpdateInput = {};
  const textFields = ["company", "title", "url", "source", "location", "description", "matchReason", "resumeVersion"];

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

  if (!Object.keys(data).length) {
    response.status(400).json({ error: "No valid fields to update" });
    return;
  }

  try {
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
  const id = stringValue(request.params.id);
  if (!id) {
    response.status(400).json({ error: "Job id is required" });
    return;
  }
  try {
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

export default jobRouter;
