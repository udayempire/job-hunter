import express, { type Request, type Response, type Router } from "express";
import { db, ShareLinkType } from "@repo/db";
import { requireAuth, type AuthenticatedRequest } from "../auth/require-auth.js";

const sharedRouter: Router = express.Router();

sharedRouter.get("/jobs/:token", async (request: Request, response: Response) => {
  const token = typeof request.params.token === "string" ? request.params.token : "";
  if (!token) {
    response.status(404).json({ error: "Shared job not found" });
    return;
  }

  const shareLink = await db.shareLink.findFirst({
    where: {
      token,
      type: ShareLinkType.JOB,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: { job: { include: { recruiters: true } } },
  });

  if (!shareLink?.job) {
    response.status(404).json({ error: "Shared job not found" });
    return;
  }

  const { personalNotes: _personalNotes, ...publicJob } = shareLink.job;
  response.json({ data: publicJob });
});

sharedRouter.post("/jobs/:token/clone", requireAuth, async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const token = typeof request.params.token === "string" ? request.params.token : "";
  const shareLink = await db.shareLink.findFirst({
    where: { token, type: ShareLinkType.JOB, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    include: { job: { include: { recruiters: true } } },
  });

  if (!shareLink?.job) {
    response.status(404).json({ error: "Shared job not found" });
    return;
  }

  const source = shareLink.job;
  const clonedJob = await db.job.create({
    data: {
      ownerId: userId,
      company: source.company,
      title: source.title,
      applyLink: source.applyLink,
      url: source.url,
      source: source.source,
      location: source.location,
      salary: source.salary,
      companyWebsite: source.companyWebsite,
      companyLinkedin: source.companyLinkedin,
      companyX: source.companyX,
      description: source.description,
      personalNotes: null,
      requirements: source.requirements ?? undefined,
      status: "SAVED",
      visibility: "PRIVATE",
      recruiters: { create: source.recruiters.map(({ role, email, link }) => ({ role, email, link })) },
    },
    include: { recruiters: true },
  });

  response.status(201).json({ data: clonedJob });
});

export default sharedRouter;
