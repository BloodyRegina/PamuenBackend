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

export const getEvaluationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true } },
        topics: {
          include: { indicators: true } // ดึงข้อมูลหัวข้อและตัวชี้วัดมาด้วยเลยสำหรับหน้า Detail
        }
      },
    });

    if (!evaluation) {
      // สามารถปรับไปใช้ errorResponse ตามที่มีในโปรเจกต์คุณได้เลย
      return res.status(404).json({ success: false, message: "Evaluation not found" }); 
    }

    return successResponse(res, evaluation, "Evaluation retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (status) {
      if (!["DRAFT", "OPEN", "CLOSED"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status. Must be DRAFT, OPEN, or CLOSED" });
      }
      updateData.status = status;
    }

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, evaluation, "Evaluation updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prisma จะลบข้อมูลใน Topic, Indicator, Assignment, Result ที่เกี่ยวข้องให้ทั้งหมดอัตโนมัติ
    await prisma.evaluation.delete({
      where: { id },
    });
    
    return successResponse(res, null, "Evaluation and all related data deleted successfully");
  } catch (error) {
    next(error);
  }
};
