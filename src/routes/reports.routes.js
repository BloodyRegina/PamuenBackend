import express from "express";
import { getEvaluationReport } from "../controllers/reports.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// GET /api/reports/evaluation/:evaluationId/result
router.get("/evaluation/:evaluationId/result", getEvaluationReport);

export default router;
