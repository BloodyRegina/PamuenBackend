import express from "express";
import { getUsers } from "../controllers/admin/users.controller.js";
import {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
} from "../controllers/admin/periods.controller.js";
import {
  createTopic,
  getTopics,
  updateTopic,
  deleteTopic,
} from "../controllers/admin/topics.controller.js";
import {
  createIndicator,
  getIndicators,
  updateIndicator,
  deleteIndicator,
} from "../controllers/admin/indicators.controller.js";
import {
  createAssignment,
  getAssignments,
  deleteAssignment,
} from "../controllers/admin/assignments.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Apply auth & role middleares to all admin routes
router.use(authMiddleware);
router.use(authorizeRoles("ADMIN"));

router.get("/users", getUsers);

// Evaluations (Periods)
router.post("/evaluations", createEvaluation);
router.get("/evaluations", getEvaluations);
router.get("/evaluations/:id", getEvaluationById); // <-- เพิ่มใหม่
router.put("/evaluations/:id", updateEvaluation); // <-- เพิ่มใหม่
router.delete("/evaluations/:id", deleteEvaluation); // <-- เพิ่มใหม่

// Topics
router.post("/topics", createTopic);
router.get("/topics", getTopics);
router.put("/topics/:id", updateTopic); // <-- เพิ่มใหม่
router.delete("/topics/:id", deleteTopic); // <-- เพิ่มใหม่

// Indicators
router.post("/indicators", createIndicator);
router.get("/indicators", getIndicators);
router.put("/indicators/:id", updateIndicator); // <-- เพิ่มใหม่
router.delete("/indicators/:id", deleteIndicator); // <-- เพิ่มใหม่

// Assignments
router.post("/assignments", createAssignment);
router.get("/assignments", getAssignments);
router.delete("/assignments/:id", deleteAssignment); // <-- เพิ่มใหม่

export default router;
