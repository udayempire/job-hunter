import express, { type Request, type Response, type Router } from "express";
import { db, ShareLinkType } from "@repo/db";

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

export default sharedRouter;
