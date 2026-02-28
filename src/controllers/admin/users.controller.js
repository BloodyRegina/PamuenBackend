import prisma from "../../prisma/client.js";
import { successResponse } from "../../utils/response.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        empId: true,
        name: true,
        role: true,
        email: true,
        department: { select: { id: true, name: true } },
      },
    });
    return successResponse(res, users, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};