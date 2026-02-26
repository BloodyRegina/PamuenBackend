import express from "express";
import { getEvaluationReport } from "../controllers/reports.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Endpoint accessible to Admin, Evaluator, Evaluatee (permissions handled inside the controller based on req.query)
router.get("/", getEvaluationReport);

export default router;
