import express, { type Router } from "express";
import jobsRouter from "./jobs.routes.js";
import authRouter from "./auth.routes.js";

const router: Router = express.Router();

router.use("/jobs", jobsRouter);
router.use("/auth", authRouter);

export default router;
