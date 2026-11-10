import { httpServerHandler } from "cloudflare:node";
import { env } from "cloudflare:workers";
import { configureDb } from "@repo/db";
import { createApp } from "./app.js";

const app = createApp(() => {
  // Hyperdrive connection access must happen inside a request handler.
  configureDb(env.HYPERDRIVE.connectionString);
});
app.listen(3000);

export default httpServerHandler({ port: 3000 });
