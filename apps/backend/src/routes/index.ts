import express from "express";
import jobsRouter from "./jobs.routes.js";

const router = express.Router();

router.use("/jobs", jobsRouter);

export default router;
