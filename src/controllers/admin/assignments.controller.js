import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const createAssignment = async (req, res, next) => {
  try {
    const { evaluationId, evaluatorId, evaluateeId } = req.body;

    // Check if evaluator and evaluatee exist
    const evaluator = await prisma.user.findUnique({
      where: { id: evaluatorId },
    });
    const evaluatee = await prisma.user.findUnique({
      where: { id: evaluateeId },
    });

    if (!evaluator || !evaluatee) {
      return errorResponse(res, "Evaluator or evaluatee not found", 404);
    }

    const assignment = await prisma.assignment.create({
      data: {
        evaluationId,
        evaluatorId,
        evaluateeId,
      },
      include: {
        evaluator: { select: { empId: true, name: true } },
        evaluatee: { select: { empId: true, name: true } },
      },
    });

    return successResponse(
      res,
      assignment,
      "Assignment created successfully",
      201,
    );
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "DUPLICATE_ASSIGNMENT" });
    }
    next(error);
  }
};

export const getAssignments = async (req, res, next) => {
  try {
    const { evaluationId } = req.query;

    const where = {};
    if (evaluationId) {
      where.evaluationId = evaluationId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        evaluator: { select: { name: true, empId: true, role: true } },
        evaluatee: { select: { name: true, empId: true } },
        indicatorResults: true, // ✅ เพิ่มบรรทัดนี้เพื่อดึงผลคะแนน
      },
    });

    return successResponse(
      res,
      assignments,
      "Assignments retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};
// เพิ่มต่อท้ายไฟล์เดิม
export const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.assignment.delete({
      where: { id },
    });

    return successResponse(res, null, "Assignment deleted successfully");
  } catch (error) {
    next(error);
  }
};