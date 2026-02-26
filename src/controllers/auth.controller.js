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
      "Login successful",
    );
  } catch (error) {
    next(error);
  }
};
