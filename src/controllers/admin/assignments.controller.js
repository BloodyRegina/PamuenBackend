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
        evaluator: { select: { name: true, empId: true } },
        evaluatee: { select: { name: true, empId: true } },
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
