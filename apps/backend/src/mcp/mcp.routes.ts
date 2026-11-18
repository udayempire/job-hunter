import { getOAuthProtectedResourceMetadataUrl, requireBearerAuth } from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";

import express, { NextFunction, Request, Response, Router } from "express";
import { mcpServerUrl } from "./config.js";
import { createJobHuntiMcpServer } from "./mcp.server.js";
import { workosTokenVerifier } from "./workos-token.js";

const mcpRouter: Router = express.Router();
const resourceUrl = mcpServerUrl();

const mcpHandler = createMcpHandler(
    ({ authInfo }) => {
        if (!authInfo) {
            throw new Error("Authenticated MCP identity is required");
        }
        return createJobHuntiMcpServer(authInfo);
    },
    {
        // Support existing MCP clients while keeping every request stateless.
        legacy: "stateless",

        // Return a normal JSON response instead of opening an SSE stream.
        responseMode: "json",
        onerror(error) {
            console.error("MCP request failed", error);
        },
    },
)
const nodeHandler = toNodeHandler(mcpHandler);

mcpRouter.post("/mcp", requireBearerAuth({
    verifier: workosTokenVerifier,
    expectedResource: resourceUrl,
    resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(resourceUrl),
}),
    async (
        request: Request,
        response: Response,
        next: NextFunction,
    ) => {
        try {
            // express.json() has already parsed the request body.
            await nodeHandler(request, response, request.body);
        } catch (error) {
            next(error);
        }
    }
);

export default mcpRouter;