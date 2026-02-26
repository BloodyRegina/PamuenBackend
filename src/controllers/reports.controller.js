import prisma from "../prisma/client.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getEvaluationReport = async (req, res, next) => {
  try {
    const { evaluationId, evaluateeId } = req.query;

    if (!evaluationId || !evaluateeId) {
      return errorResponse(
        res,
        "Please provide evaluationId and evaluateeId",
        400,
      );
    }

    // Role check logic (Admin can see all, Evaluator can see only assignments they evaluate, Evaluatee can see only theirs)
    if (req.user.role === "Evaluatee" && req.user.id !== evaluateeId) {
      return errorResponse(res, "You can only view your own report", 403);
    }

    // Fetch all assignments for this evaluatee in this evaluation
    const assignments = await prisma.assignment.findMany({
      where: {
        evaluationId,
        evaluateeId,
      },
      include: {
        evaluator: { select: { name: true } },
      },
    });

    if (assignments.length === 0) {
      return errorResponse(res, "No assignments found for this evaluatee", 404);
    }

    // Since one evaluation might have multiple evaluators assigned to the same evaluatee, we will average or list them.
    // For simplicity, let's calculate the score per assignment

    // Fetch all the topics and indicators required for this evaluation to form a template
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        topics: {
          include: {
            indicators: true,
          },
        },
      },
    });

    const reportResults = [];

    // Process each evaluator's assignment
    for (const assignment of assignments) {
      const results = await prisma.indicatorResult.findMany({
        where: { assignmentId: assignment.id },
        include: {
          indicator: true,
        },
      });

      // Calculate the scores based on the requirements:
      // Scale 1-4: (score/4) * weight
      // yes/no: (score) * weight (Assuming score is 1 for Yes, 0 for No)

      let totalOverallScore = 0;
      let totalWeight = 0;

      const scoredTopics = evaluation.topics.map((topic) => {
        const indicatorsWithScores = topic.indicators.map((ind) => {
          const matchingResult = results.find((r) => r.indicatorId === ind.id);
          const rawScore = matchingResult ? matchingResult.score : 0;

          let adjustedScore = 0;
          if (ind.indicatorType === "scale") {
            adjustedScore = (rawScore / 4) * ind.weight;
          } else if (ind.indicatorType === "yesno") {
            adjustedScore = rawScore * ind.weight;
          }

          totalOverallScore += adjustedScore;
          totalWeight += ind.weight;

          return {
            indicatorId: ind.id,
            name: ind.name,
            weight: ind.weight,
            type: ind.indicatorType,
            rawScore,
            adjustedScore,
          };
        });

        const topicTotalScore = indicatorsWithScores.reduce(
          (sum, current) => sum + current.adjustedScore,
          0,
        );

        return {
          topicId: topic.id,
          name: topic.name,
          indicators: indicatorsWithScores,
          topicTotalScore,
        };
      });

      reportResults.push({
        assignmentId: assignment.id,
        evaluatorName: assignment.evaluator.name,
        totalWeight,
        totalOverallScore,
        topics: scoredTopics,
      });
    }

    return successResponse(
      res,
      reportResults,
      "Report configured successfully",
    );
  } catch (error) {
    next(error);
  }
};
