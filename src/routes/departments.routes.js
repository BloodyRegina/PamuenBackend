import express from "express";
import { getDepartments } from "../controllers/departments.controller.js";

const router = express.Router();

router.get("/", getDepartments);

export default router;
