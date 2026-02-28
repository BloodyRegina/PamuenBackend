import express from "express";
import { getMyEvaluations } from "../controllers/me/evaluation.controller.js";
import { uploadEvidence, getMyEvidences, deleteEvidence } from "../controllers/me/evidence.controller.js";
import { getDashboardStats } from "../controllers/me/dashboard.controller.js"; // <-- นำเข้า Controller ใหม่
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// เพิ่มเส้นทาง Dashboard ใหม่
router.get("/dashboard", getDashboardStats);

router.get("/evaluations", getMyEvaluations);
router.post("/evidence", upload.single("document"), uploadEvidence);
router.get("/evidence", getMyEvidences);
router.delete("/evidence/:id", deleteEvidence);
export default router;