import express from "express";
import { getMyAssignments, getAssignmentById } from "../controllers/evaluator/assignments.controller.js";
import { submitResults } from "../controllers/evaluator/results.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(authorizeRoles("EVALUATOR", "ADMIN"));

router.get("/assignments", getMyAssignments);
router.post("/results", submitResults);
router.get("/assignments/:id", getAssignmentById);

export default router;
