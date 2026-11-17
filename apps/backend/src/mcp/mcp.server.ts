import { McpServer, type AuthInfo } from "@modelcontextprotocol/server";
import { registerJobTools } from "./tools/jobs.tools.js";

export function createJobHuntiMcpServer(authInfo: AuthInfo) {
    const server = new McpServer({
        name: "job-hunti",
        version: "1.0.0",
    });
    registerJobTools(server, authInfo);
    return server;
}
