import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const submitResults = async (req, res, next) => {
  try {
    const evaluatorId = req.user.id;
    const { assignmentId, scores } = req.body; // scores: [{ indicatorId: "id", score: 4 }]

    // Verify assignment belongs to this evaluator
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        evaluation: true,
      },
    });

    if (!assignment) {
      return errorResponse(res, "Assignment not found", 404);
    }

    if (assignment.evaluatorId !== evaluatorId) {
      return errorResponse(res, "You are not the assigned evaluator", 403);
    }

    // Process logic to delete old results to replace, or use upsert.
    // Here we can simply delete all existing results and insert new ones or insert if don't exist
    await prisma.indicatorResult.deleteMany({
      where: { assignmentId },
    });

    const dataPayload = scores.map((s) => ({
      indicatorId: s.indicatorId,
      assignmentId,
      score: s.score,
    }));

    await prisma.indicatorResult.createMany({
      data: dataPayload,
    });

    return successResponse(
      res,
      null,
      "Evaluation results submitted successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};
