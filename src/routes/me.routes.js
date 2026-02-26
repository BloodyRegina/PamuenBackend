import express from "express";
import { getMyEvaluations } from "../controllers/me/evaluation.controller.js";
import {
  uploadEvidence,
  getMyEvidences,
} from "../controllers/me/evidence.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/evaluations", getMyEvaluations);

// Require multer upload middleware
router.post("/evidence", upload.single("document"), uploadEvidence);
router.get("/evidence", getMyEvidences);

export default router;
