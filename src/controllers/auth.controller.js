import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const login = async (req, res, next) => {
  try {
    const { empId, password } = req.body;

    if (!empId || !password) {
      return errorResponse(res, "Please provide empId and password", 400);
    }

    const user = await prisma.user.findUnique({
      where: { empId },
      include: {
        department: true,
      },
    });

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const token = jwt.sign(
      { id: user.id, empId: user.empId, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          empId: user.empId,
          name: user.name,
          role: user.role,
          email: user.email,
          department: user.department.name,
        },
      },
      "Login successful"
    );
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { empId, name, departmentId, role, email, password } = req.body;

    if (!empId || !name || !departmentId || !role || !email || !password) {
      return errorResponse(res, "Please provide all required fields", 400);
    }

    if (role === "ADMIN") {
      return errorResponse(res, "Cannot register as ADMIN", 403);
    }

    if (role !== "EVALUATOR" && role !== "EVALUATEE") {
      return errorResponse(res, "Invalid role context", 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ empId }, { email }],
      },
    });

    if (existingUser) {
      return errorResponse(res, "Employee ID or Email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        empId,
        name,
        departmentId,
        role,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return successResponse(res, userWithoutPassword, "Registration successful", 201);
  } catch (error) {
    next(error);
  }
};
