import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const createEvaluation = async (req, res, next) => {
  try {
    const { name, startDate, endDate } = req.body;

    // Ensure dates are correctly formatted
    const start = new Date(startDate);
    const end = new Date(endDate);

    const evaluation = await prisma.evaluation.create({
      data: {
        name,
        startDate: start,
        endDate: end,
        createdBy: req.user.id,
      },
    });

    return successResponse(
      res,
      evaluation,
      "Evaluation period created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const getEvaluations = async (req, res, next) => {
  try {
    const evals = await prisma.evaluation.findMany({
      include: {
        creator: { select: { name: true } },
      },
    });
    return successResponse(res, evals, "Evaluations retrieved successfully");
  } catch (error) {
    next(error);
  }
};
