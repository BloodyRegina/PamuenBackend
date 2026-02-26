import { errorResponse } from "../utils/response.js";

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Role ${req.user ? req.user.role : "Guest"} is not authorized to access this route`,
        403,
      );
    }
    next();
  };
};
