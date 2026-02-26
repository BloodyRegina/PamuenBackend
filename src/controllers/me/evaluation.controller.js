import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const getMyEvaluations = async (req, res, next) => {
  try {
    const evaluateeId = req.user.id;
    const { evaluationId } = req.query;

    const where = { evaluateeId };
    if (evaluationId) {
      where.evaluationId = evaluationId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        evaluator: { select: { id: true, name: true, empId: true } },
        evaluation: {
          select: { id: true, name: true, startDate: true, endDate: true },
        },
        indicatorResults: {
          include: {
            indicator: true,
          },
        },
      },
    });

    return successResponse(
      res,
      assignments,
      "Your evaluations retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};
