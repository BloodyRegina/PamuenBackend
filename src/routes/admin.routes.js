import express from "express";
import { createUser, getUsers } from "../controllers/admin/users.controller.js";
import {
  createEvaluation,
  getEvaluations,
} from "../controllers/admin/periods.controller.js";
import {
  createTopic,
  getTopics,
} from "../controllers/admin/topics.controller.js";
import {
  createIndicator,
  getIndicators,
} from "../controllers/admin/indicators.controller.js";
import {
  createAssignment,
  getAssignments,
} from "../controllers/admin/assignments.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Apply auth & role middleares to all admin routes
router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));

// Users
router.post("/users", createUser);
router.get("/users", getUsers);

// Evaluations (Periods)
router.post("/evaluations", createEvaluation);
router.get("/evaluations", getEvaluations);

// Topics
router.post("/topics", createTopic);
router.get("/topics", getTopics);

// Indicators
router.post("/indicators", createIndicator);
router.get("/indicators", getIndicators);

// Assignments
router.post("/assignments", createAssignment);
router.get("/assignments", getAssignments);

export default router;
