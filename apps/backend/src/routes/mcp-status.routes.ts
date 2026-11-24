import express, { type Request, type Response, type Router } from "express";
import { db, McpAuditOutcome } from "@repo/db";
import { requireAuth, type AuthenticatedRequest } from "../auth/require-auth.js";

const mcpStatusRouter: Router = express.Router();
mcpStatusRouter.use(requireAuth);

mcpStatusRouter.get("/status", async (request: Request, response: Response) => {
  const userId = (request as AuthenticatedRequest).userId;
  const lastEvent = await db.mcpAuditEvent.findFirst({
    where: { userId, outcome: McpAuditOutcome.SUCCESS },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, clientId: true },
  });
  response.json({
    data: {
      connected: Boolean(lastEvent),
      lastSeenAt: lastEvent?.createdAt ?? null,
      clientId: lastEvent?.clientId ?? null,
    },
  });
});

export default mcpStatusRouter;
