import { httpServerHandler } from "cloudflare:node";
import { env } from "cloudflare:workers";
import { configureDb } from "@repo/db";
import { createApp } from "./app.js";

configureDb(env.HYPERDRIVE.connectionString);

const app = createApp();
app.listen(3000);

export default httpServerHandler({ port: 3000 });
