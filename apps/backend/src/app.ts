import cors from "cors";
import express, { type Express } from "express";
import apiRouter from "./routes/index.js";

export function createApp(initialize?: () => void): Express {
  const app = express();

  if (initialize) {
    app.use((_request, _response, next) => {
      initialize();
      next();
    });
  }

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
