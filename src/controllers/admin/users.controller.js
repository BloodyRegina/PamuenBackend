import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res, next) => {
  try {
    const { empId, name, departmentId, role, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        empId,
        name,
        departmentId,
        role,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        empId: true,
        name: true,
        role: true,
        email: true,
        departmentId: true,
      },
    });

    return successResponse(res, user, "User created successfully", 201);
  } catch (error) {
    next(error);
  }
};

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
