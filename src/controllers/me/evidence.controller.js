import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const uploadEvidence = async (req, res, next) => {
  try {
    const evaluateeId = req.user.id;
    const { indicatorId } = req.body;

    // Check if the file is uploaded via multer
    if (!req.file) {
      return errorResponse(res, "No file uploaded", 400);
    }

    const filename = req.file.filename;

    const evidence = await prisma.indicatorEvidence.create({
      data: {
        indicatorId,
        evaluateeId,
        filename,
      },
    });

    return successResponse(
      res,
      evidence,
      "Evidence uploaded successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const getMyEvidences = async (req, res, next) => {
  try {
    const evaluateeId = req.user.id;
    const { indicatorId } = req.query;

    const where = { evaluateeId };
    if (indicatorId) {
      where.indicatorId = indicatorId;
    }

    const evidences = await prisma.indicatorEvidence.findMany({
      where,
      include: {
        indicator: { select: { name: true } },
      },
    });

    return successResponse(res, evidences, "Evidences retrieved successfully");
  } catch (error) {
    next(error);
  }
};
