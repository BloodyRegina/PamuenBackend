import express from "express";
import cors from "cors";
import helmet from "helmet";

// Import Routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import evaluatorRoutes from "./routes/evaluator.routes.js";
import meRoutes from "./routes/me.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
// We didn't explicitly create system.routes.js but we can add health check later if needed

// Import Middlewares
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Security & basic middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Map Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/evaluator", evaluatorRoutes);
app.use("/api/me", meRoutes);
app.use("/api/reports", reportsRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
