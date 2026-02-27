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

export const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        evaluatee: {
          select: { id: true, empId: true, name: true },
        },
        evaluation: {
          include: {
            topics: {
              include: {
                indicators: true,
              },
            },
          },
        },
        indicatorResults: true, // ✅ เปลี่ยนเป็นชื่อนี้ครับ
      },
    });

    if (!assignment) {
      return errorResponse(res, "ไม่พบข้อมูลการมอบหมายงานนี้", 404);
    }

    // ตรวจสอบสิทธิ์: ผู้ประเมินต้องเป็นเจ้าของงานนี้ หรือเป็น ADMIN
    if (assignment.evaluatorId !== req.user.id && req.user.role !== "ADMIN") {
      return errorResponse(res, "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้", 403);
    }

    return successResponse(res, assignment, "ดึงข้อมูลสำเร็จ");
  } catch (error) {
    next(error);
  }
};
