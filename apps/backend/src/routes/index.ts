import express, { type Router } from "express";
import jobsRouter from "./jobs.routes.js";

const router: Router = express.Router();

router.use("/jobs", jobsRouter);

export default router;
