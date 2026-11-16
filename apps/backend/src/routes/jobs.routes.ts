import express, { type Request, type Response, type Router } from "express";
import { db } from "@repo/db";
import { requireAuth, type AuthenticatedRequest } from "../auth/require-auth.js";
import {
  createJob,
  deleteJob,
  getJob,
  JobServiceError,
  listJobs,
  updateJob,
} from "../services/jobs.service.js";

const jobRouter: Router = express.Router();
jobRouter.use(requireAuth);

function stringValue(value: unknown): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined;
}

jobRouter.get("/", async (request: Request, response: Response) => {
  try {
    const userId = (request as AuthenticatedRequest).userId;
    const result = await listJobs(userId, request.query);
    response.json({ data: result.jobs, pagination: result.pagination });
  } catch (error) {
    respondWithServiceError(response, error, "Failed to load jobs");
  }
});

jobRouter.get("/:id", async (request: Request, response: Response) => {
  try {
    const userId = (request as AuthenticatedRequest).userId;
    response.json({ data: await getJob(userId, request.params.id) });
  } catch (error) {
    respondWithServiceError(response, error, "Failed to load job");
  }
});

jobRouter.post("/", async (request: Request, response: Response) => {
  try {
    const userId = (request as AuthenticatedRequest).userId;
    response.status(201).json({ data: await createJob(userId, request.body) });
  } catch (error) {
    respondWithServiceError(response, error, "Failed to create job");
  }
});

jobRouter.post("/:id/share", async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const id = stringValue(request.params.id);
  if (!id) {
    response.status(400).json({ error: "Job id is required" });
    return;
  }

  const job = await db.job.findFirst({ where: { id, ownerId: userId }, select: { id: true } });
  if (!job) {
    response.status(404).json({ error: "Job not found" });
    return;
  }

  const shareLink = await db.shareLink.create({ data: { type: "JOB", userId, jobId: job.id } });
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3001";
  response.status(201).json({ data: { token: shareLink.token, url: `${frontendUrl}/share/jobs/${shareLink.token}` } });
});

jobRouter.patch("/:id", async (request: Request, response: Response) => {
  try {
    const userId = (request as AuthenticatedRequest).userId;
    response.json({ data: await updateJob(userId, request.params.id, request.body) });
  } catch (error) {
    respondWithServiceError(response, error, "Failed to update job");
  }
});

jobRouter.delete("/:id", async (request: Request, response: Response) => {
  try {
    const userId = (request as AuthenticatedRequest).userId;
    await deleteJob(userId, request.params.id);
    response.status(204).send();
  } catch (error) {
    respondWithServiceError(response, error, "Failed to delete job");
  }
});

function respondWithServiceError(
  response: Response,
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof JobServiceError) {
    response.status(error.status).json({
      error: error.message,
      ...(error.data ? { data: error.data } : {}),
    });
    return;
  }
  console.error(fallbackMessage, error);
  response.status(500).json({ error: fallbackMessage });
}

export default jobRouter;
