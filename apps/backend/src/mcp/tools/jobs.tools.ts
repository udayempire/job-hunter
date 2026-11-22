import {
    type AuthInfo,
    type CallToolResult,
    type McpServer,
} from "@modelcontextprotocol/server";
import { db, JobStatus, McpAuditOutcome } from "@repo/db";
import { z } from "zod";
import {
    createJob,
    getJob,
    JobServiceError,
    listJobsSummary,
    updateJob,
} from "../../services/jobs.service.js";
import {
    createJobSchema,
    jobStatusSchema,
    updateJobSchema,
} from "./jobTools.schemas.js";

type McpPrincipal = {
    userId: string;
    workosUserId: string;
    clientId: string;
    scopes: string[];
};

/**
 * Checks a fine-grained job scope ("jobs:read" / "jobs:write"; write implies read).
 *
 * WorkOS AuthKit is not yet configured to issue these scopes, so a token that
 * carries no "jobs:*" scope at all is treated as unrestricted (legacy/full
 * access) rather than denied — this check only starts restricting access once
 * the AuthKit app is configured to hand out "jobs:read" / "jobs:write".
 */
function hasScope(principal: McpPrincipal, required: "jobs:read" | "jobs:write"): boolean {
    const jobScopes = principal.scopes.filter((scope) => scope.startsWith("jobs:"));
    if (jobScopes.length === 0) return true;
    if (required === "jobs:read") {
        return jobScopes.includes("jobs:read") || jobScopes.includes("jobs:write");
    }
    return jobScopes.includes("jobs:write");
}

function scopeErrorResult(toolName: string): CallToolResult {
    return {
        isError: true,
        content: [
            {
                type: "text",
                text: `The connected token does not have the scope required to call ${toolName}.`,
            },
        ],
    };
}

export function registerJobTools(server: McpServer, authInfo: AuthInfo) {
    const principal = principalFromAuthInfo(authInfo);

    registerListJobsTool(server, principal);
    registerGetJobTool(server, principal);
    registerCreateJobTool(server, principal);
    registerUpdateJobTool(server, principal);
    registerPipelineSummaryTool(server, principal);
}

function registerListJobsTool(server: McpServer, principal: McpPrincipal) {
    server.registerTool(
        "list_jobs",
        {
            title: "List saved jobs",
            description:
                "List jobs belonging to the authenticated Job Hunti user as lightweight summaries (no description text or full recruiter records). Use search to match company, title, or description, and status to filter the pipeline. pagination.hasMore tells you whether another page exists. Use this before creating a job when checking whether it may already exist, and call get_job to see full details for one job.",
            inputSchema: z.object({
                search: z.string().min(1).optional(),
                status: jobStatusSchema.optional(),
                skip: z.number().int().min(0).default(0),
                take: z.number().int().min(1).max(100).default(20),
            }),
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
            },
        },
        async (input) => {
            if (!hasScope(principal, "jobs:read")) {
                await recordAudit(principal, "list_jobs", McpAuditOutcome.DENIED);
                return scopeErrorResult("list_jobs");
            }
            try {
                const result = await listJobsSummary(principal.userId, input);
                await recordAudit(principal, "list_jobs", McpAuditOutcome.SUCCESS);
                return successResult(result);
            } catch (error) {
                await recordAudit(principal, "list_jobs", auditOutcome(error));
                return errorResult(error, "Failed to list jobs");
            }
        },
    );
}

function registerGetJobTool(server: McpServer, principal: McpPrincipal) {
    server.registerTool(
        "get_job",
        {
            title: "Get job details",
            description:
                "Get one job owned by the authenticated Job Hunti user. Returns the full saved job, including description, research, application status, fit information, and recruiter contacts.",
            inputSchema: z.object({
                id: z.string().min(1).describe("The Job Hunti job ID."),
            }),
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
            },
        },
        async ({ id }) => {
            if (!hasScope(principal, "jobs:read")) {
                await recordAudit(principal, "get_job", McpAuditOutcome.DENIED, id);
                return scopeErrorResult("get_job");
            }
            try {
                const job = await getJob(principal.userId, id);
                await recordAudit(principal, "get_job", McpAuditOutcome.SUCCESS, job.id);
                return successResult(job);
            } catch (error) {
                await recordAudit(principal, "get_job", auditOutcome(error));
                return errorResult(error, "Failed to load the job");
            }
        },
    );
}

function registerCreateJobTool(server: McpServer, principal: McpPrincipal) {
    server.registerTool(
        "create_job",
        {
            title: "Save a new job",
            description:
                "Create a private job for the authenticated Job Hunti user. Call this only when the user explicitly asks to save or create a job. At least one of applyLink or detailsUrl is required. Do not invent company, job, salary, or recruiter information.",
            inputSchema: createJobSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: false,
                openWorldHint: false,
            },
        },
        async (input) => {
            if (!hasScope(principal, "jobs:write")) {
                await recordAudit(principal, "create_job", McpAuditOutcome.DENIED);
                return scopeErrorResult("create_job");
            }
            try {
                const job = await createJob(principal.userId, input);
                await recordAudit(
                    principal,
                    "create_job",
                    McpAuditOutcome.SUCCESS,
                    job.id,
                );
                return successResult(job);
            } catch (error) {
                await recordAudit(principal, "create_job", auditOutcome(error));
                return errorResult(error, "Failed to create the job");
            }
        },
    );
}

function registerUpdateJobTool(server: McpServer, principal: McpPrincipal) {
    server.registerTool(
        "update_job",
        {
            title: "Update or enrich a job",
            description:
                "Update a job owned by the authenticated Job Hunti user. Omitted fields remain unchanged and null explicitly clears a nullable field. Recruiters without an ID are appended; recruiters with an existing ID are updated. Only save researched facts when reliable researchSources or recruiter sourceUrl values are provided. Never fabricate recruiter names, emails, salaries, or company details. Change status only when the user explicitly requests it.",
            inputSchema: updateJobSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: false,
                openWorldHint: false,
            },
        },
        async ({ id, ...changes }) => {
            if (!hasScope(principal, "jobs:write")) {
                await recordAudit(principal, "update_job", McpAuditOutcome.DENIED, id);
                return scopeErrorResult("update_job");
            }
            try {
                // Only mark the job "enriched" when the changes carry an actual
                // source: a research citation, or a recruiter with a sourceUrl.
                // A bare recruiter name/email with no source doesn't count.
                const researched =
                    Boolean(changes.researchSources?.length) ||
                    Boolean(changes.recruiters?.some((recruiter) => Boolean(recruiter.sourceUrl)));
                const job = await updateJob(principal.userId, id, changes, {
                    appendRecruiters: true,
                    markEnriched: researched,
                });
                await recordAudit(
                    principal,
                    "update_job",
                    McpAuditOutcome.SUCCESS,
                    job.id,
                );
                return successResult(job);
            } catch (error) {
                await recordAudit(principal, "update_job", auditOutcome(error));
                return errorResult(error, "Failed to update the job");
            }
        },
    );
}

function registerPipelineSummaryTool(
    server: McpServer,
    principal: McpPrincipal,
) {
    server.registerTool(
        "get_pipeline_summary",
        {
            title: "Get job pipeline summary",
            description:
                "Summarize the authenticated user's Job Hunti pipeline. Returns the total number of jobs and counts grouped by status. This tool does not modify any job.",
            inputSchema: z.object({}),
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
            },
        },
        async () => {
            if (!hasScope(principal, "jobs:read")) {
                await recordAudit(principal, "get_pipeline_summary", McpAuditOutcome.DENIED);
                return scopeErrorResult("get_pipeline_summary");
            }
            try {
                const groupedJobs = await db.job.groupBy({
                    by: ["status"],
                    where: { ownerId: principal.userId },
                    _count: { _all: true },
                });
                const byStatus = Object.fromEntries(
                    Object.values(JobStatus).map((status) => [status, 0]),
                ) as Record<string, number>;
                for (const group of groupedJobs) {
                    byStatus[group.status] = group._count._all;
                }
                const total = Object.values(byStatus).reduce(
                    (sum, count) => sum + count,
                    0,
                );
                await recordAudit(principal, "get_pipeline_summary", McpAuditOutcome.SUCCESS);
                return successResult({ total, byStatus });
            } catch (error) {
                await recordAudit(principal, "get_pipeline_summary", auditOutcome(error));
                return errorResult(error, "Failed to summarize the job pipeline");
            }
        },
    );
}

function principalFromAuthInfo(authInfo: AuthInfo): McpPrincipal {
    const userId = authInfo.extra?.userId;
    const workosUserId = authInfo.extra?.workosUserId;
    if (typeof userId !== "string" || typeof workosUserId !== "string") {
        throw new Error("Authenticated MCP identity is incomplete");
    }
    return {
        userId,
        workosUserId,
        clientId: authInfo.clientId,
        scopes: authInfo.scopes ?? [],
    };
}

async function recordAudit(
    principal: McpPrincipal,
    toolName: string,
    outcome: McpAuditOutcome,
    jobId?: string,
) {
    try {
        await db.mcpAuditEvent.create({
            data: {
                userId: principal.userId,
                workosUserId: principal.workosUserId,
                clientId: principal.clientId,
                toolName,
                outcome,
                jobId,
            },
        });
    } catch (error) {
        console.error("Failed to record MCP audit event", error);
    }
}

function auditOutcome(error: unknown) {
    return error instanceof JobServiceError && error.status === 404
        ? McpAuditOutcome.DENIED
        : McpAuditOutcome.ERROR;
}

function successResult(value: unknown): CallToolResult {
    const normalized = JSON.parse(JSON.stringify(value)) as Record<
        string,
        unknown
    >;
    return {
        content: [{ type: "text", text: JSON.stringify(normalized) }],
        structuredContent: normalized,
    };
}

function errorResult(error: unknown, fallbackMessage: string): CallToolResult {
    if (error instanceof JobServiceError) {
        return {
            isError: true,
            content: [{ type: "text", text: error.message }],
        };
    }
    console.error(fallbackMessage, error);
    return {
        isError: true,
        content: [{ type: "text", text: fallbackMessage }],
    };
}
