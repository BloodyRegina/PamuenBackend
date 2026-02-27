import prisma from "../prisma/client.js";
import { successResponse, errorResponse } from "../utils/response.js";

// Get all departments
export const getDepartments = async (req, res, next) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: {
                name: "asc",
            },
        });

        return successResponse(res, departments, "Departments retrieved successfully");
    } catch (error) {
        next(error);
    }
};
