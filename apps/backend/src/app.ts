import cors from "cors";
import express from "express";
import apiRouter from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3001",
    credentials: true,
  }));
  app.use(express.json());
  app.use("/api", apiRouter);

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "job-hunter-backend" });
  });

  app.get("/api/info", (_request, response) => {
    response.json({ message: "Job Hunter API" });
  });

  return app;
}
