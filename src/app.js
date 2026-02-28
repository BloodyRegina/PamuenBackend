import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import evaluatorRoutes from "./routes/evaluator.routes.js";
import meRoutes from "./routes/me.routes.js";
import departmentRoutes from "./routes/departments.routes.js";

// Import Middlewares
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Security & basic middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Map Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/evaluator", evaluatorRoutes);
app.use("/api/me", meRoutes);
app.use("/api/departments", departmentRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
