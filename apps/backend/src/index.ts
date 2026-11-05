import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3001" }));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "job-hunter-backend" });
});

app.get("/api", (_request, response) => {
  response.json({ message: "Job Hunter API" });
});

app.listen(port, () => {
  console.log(`Job Hunter backend listening on http://localhost:${port}`);
});
