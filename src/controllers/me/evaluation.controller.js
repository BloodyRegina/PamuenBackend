import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const getMyEvaluations = async (req, res, next) => {
  try {
    const evaluateeId = req.user.id;
    const assignments = await prisma.assignment.findMany({
      where: { evaluateeId },
      include: {
        evaluator: {
          select: { id: true, name: true, empId: true, role: true }
        },
        evaluation: {
          include: {
            topics: {
              include: {
                indicators: true
              }
            }
          }
        },
        indicatorResults: true
      }
    });

    return successResponse(res, assignments, "ดึงข้อมูลการประเมินของคุณสำเร็จ");
  } catch (error) {
    next(error);
  }
};