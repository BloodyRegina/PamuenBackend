import { errorResponse } from "../utils/response.js";

export const errorHandler = (err, req, res, next) => {
  console.error("[Error]:", err.message);

  // Custom Prisma Errors handles can go here
  if (err.code === "P2002") {
    return errorResponse(res, "Unique constraint failed", 400, err.meta);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "development" ? err.stack : null,
  );
};
