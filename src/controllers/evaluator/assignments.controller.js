import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const getMyAssignments = async (req, res, next) => {
  try {
    const evaluatorId = req.user.id;
    const { evaluationId } = req.query;

    const where = { evaluatorId };
    if (evaluationId) {
      where.evaluationId = evaluationId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        evaluatee: {
          select: {
            id: true,
            empId: true,
            name: true,
            department: { select: { name: true } },
          },
        },
        evaluation: {
          select: { name: true, startDate: true, endDate: true },
        },
        indicatorResults: {
          select: { id: true, score: true, indicatorId: true }, // to check if already evaluated
        },
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
