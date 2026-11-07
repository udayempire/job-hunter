import express, { type Router } from "express";
import jobsRouter from "./jobs.routes.js";
import authRouter from "./auth.routes.js";
import sharedRouter from "./shared.routes.js";
import profileRouter from "./profiles.routes.js";

const router: Router = express.Router();

router.use("/jobs", jobsRouter);
router.use("/auth", authRouter);
router.use("/shared", sharedRouter);
router.use("/profiles", profileRouter);

export default router;
