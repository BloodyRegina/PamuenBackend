import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const createIndicator = async (req, res, next) => {
  try {
    const {
      topicId,
      name,
      description,
      indicatorType,
      requireEvidence,
      weight,
    } = req.body;

    const indicator = await prisma.indicator.create({
      data: {
        topicId,
        name,
        description,
        indicatorType, // "scale" or "yesno"
        requireEvidence,
        weight,
      },
    });

    return successResponse(
      res,
      indicator,
      "Indicator created successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const getIndicators = async (req, res, next) => {
  try {
    const { topicId } = req.query;

    const where = {};
    if (topicId) {
      where.topicId = topicId;
    }

    const indicators = await prisma.indicator.findMany({
      where,
    });

    return successResponse(
      res,
      indicators,
      "Indicators retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};
