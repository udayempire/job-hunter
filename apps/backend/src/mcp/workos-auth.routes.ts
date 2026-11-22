import { db } from "@repo/db";
import express, { type Router } from "express";
import { userIdFromCookie } from "../auth/require-auth.js";
import { mcpServerUrl, workosApiKey, workosIssuer } from "./config.js";

const workosAuthRouter: Router = express.Router();
const frontendUrl = () => process.env.FRONTEND_URL ?? "http://localhost:3001";

workosAuthRouter.get("/.well-known/oauth-protected-resource/mcp", (_request, response) => {
  try {
    response.json({
      resource: mcpServerUrl().toString(),
      authorization_servers: [workosIssuer()],
      // Not yet enforced end-to-end: WorkOS AuthKit must also be configured to
      // issue these scopes before a token actually carries them. See the
      // hasScope() comment in mcp/tools/jobs.tools.ts.
      scopes_supported: ["jobs:read", "jobs:write"],
    });
  } catch (error) {
    console.error("WorkOS MCP metadata is not configured", error);
    response.status(503).json({ error: "MCP authentication is not configured" });
  }
});

workosAuthRouter.get("/api/auth/workos", async (request, response) => {
  response.set("Cache-Control", "no-store");
  const externalAuthId = stringQueryValue(request.query.external_auth_id);
  if (!externalAuthId || externalAuthId.length > 512) {
    response.status(400).json({ error: "A valid WorkOS authentication request is required" });
    return;
  }

  const userId = await userIdFromCookie(request);
  if (!userId) {
    const returnTo = `/api/auth/workos?external_auth_id=${encodeURIComponent(externalAuthId)}`;
    response.redirect(`/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`);
    return;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) {
      response.redirect(`${frontendUrl()}/login`);
      return;
    }

    const completionResponse = await fetch("https://api.workos.com/authkit/oauth2/complete", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${workosApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_auth_id: externalAuthId,
        user: {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        },
      }),
    });

    if (!completionResponse.ok) {
      console.error("WorkOS authentication completion failed", { status: completionResponse.status });
      response.redirect(`${frontendUrl()}/?mcp_auth_error=workos_completion_failed`);
      return;
    }

    const completion: unknown = await completionResponse.json();
    const redirectUri = workosRedirectUri(completion);
    if (!redirectUri) {
      console.error("WorkOS authentication completion returned an invalid redirect URI");
      response.redirect(`${frontendUrl()}/?mcp_auth_error=workos_completion_failed`);
      return;
    }

    response.redirect(redirectUri);
  } catch (error) {
    console.error("WorkOS authentication completion failed", error);
    response.redirect(`${frontendUrl()}/?mcp_auth_error=workos_completion_failed`);
  }
});

function stringQueryValue(value: unknown) {
  return typeof value === "string" ? value.trim() : null;
}

function workosRedirectUri(value: unknown) {
  if (!value || typeof value !== "object" || !("redirect_uri" in value) || typeof value.redirect_uri !== "string") {
    return null;
  }
  try {
    const redirectUri = new URL(value.redirect_uri);
    return redirectUri.origin === workosIssuer() ? redirectUri.toString() : null;
  } catch {
    return null;
  }
}

export default workosAuthRouter;
