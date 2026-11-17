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
  listJobs,
  updateJob,
} from "../../services/jobs.service.js";
import {
  createJobSchema,
  jobStatusSchema,
  updateJobSchema,
} from "../jobTools.schemas.js";

type McpPrincipal = {
  userId: string;
  workosUserId: string;
  clientId: string;
};

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
        "List jobs belonging to the authenticated Job Hunti user. Use search to match company, title, or description, and status to filter the pipeline. Results include saved recruiter contacts. Use this before creating a job when checking whether it may already exist.",
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
      try {
        return successResult(await listJobs(principal.userId, input));
      } catch (error) {
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
      try {
        return successResult(await getJob(principal.userId, id));
      } catch (error) {
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
      try {
        const researched =
          Boolean(changes.researchSources?.length) ||
          Boolean(changes.recruiters?.length);
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
        return successResult({ total, byStatus });
      } catch (error) {
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
  return { userId, workosUserId, clientId: authInfo.clientId };
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
