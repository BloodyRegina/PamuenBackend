import prisma from "../prisma/client.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getEvaluationReport = async (req, res, next) => {
  try {
    const { evaluationId } = req.params;
    const { id: userId, role: userRole } = req.user;

    // 1. ดึงข้อมูล Assignment ของ Evaluation นี้
    const assignments = await prisma.assignment.findMany({
      where: {
        evaluationId,
      },
      include: {
        evaluator: { select: { id: true, name: true, empId: true } },
        evaluatee: { select: { id: true, name: true, empId: true } },
        indicatorResults: {
          include: {
            indicator: {
              select: {
                id: true,
                name: true,
                indicatorType: true,
                weight: true,
                topic: {
                  select: { name: true }
                }
              }
            }
          }
        },
      }
    });

    if (!assignments || assignments.length === 0) {
      return errorResponse(res, "No assignments found for this evaluation", 404);
    }

    // 2. กรองข้อมูลตามสิทธิ์ (RBAC & IDOR Protection)
    let filteredAssignments = assignments;

    if (userRole === "EVALUATOR") {
      // EVALUATOR ดูได้เฉพาะของคนที่ตัวเองประเมิน
      filteredAssignments = assignments.filter(a => a.evaluatorId === userId);
      if (filteredAssignments.length === 0) {
        return errorResponse(res, "Forbidden: You are not assigned to evaluate anyone in this evaluation", 403);
      }
    } else if (userRole === "EVALUATEE") {
      // EVALUATEE ดูได้เฉพาะของตัวเอง
      filteredAssignments = assignments.filter(a => a.evaluateeId === userId);
      if (filteredAssignments.length === 0) {
        return errorResponse(res, "Forbidden: You do not have results in this evaluation", 403);
      }
    }

    // 3. กฎ Evaluation Completion (เฉพาะ Evaluatee)
    if (userRole === "EVALUATEE") {
      // เช็คว่าสถานะของการประเมิน (Assignment) ต้องไม่ใช่ PENDING หรือต้องเป็น COMPLETED แล้ว
      // ในที่นี้ สมมติสถานะที่เสร็จสิ้นคือ "COMPLETED" (หรือตามที่ระบุใน logic ของ results.controller.js)
      const hasIncomplete = filteredAssignments.some(a => a.status !== "COMPLETED");
      if (hasIncomplete) {
        return errorResponse(res, "Forbidden: Your evaluation is not yet complete. You cannot view the results.", 403);
      }
    }

    // 4. คำนวณคะแนน (Adjusted Score)
    const reportData = filteredAssignments.map(assignment => {
      let totalRawScore = 0;
      let totalAdjustedScore = 0;

      const resultsWithAdjustment = assignment.indicatorResults.map(result => {
        const { score, indicator } = result;
        const { indicatorType, weight } = indicator;

        let adjustedScore = 0;

        if (indicatorType === 'SCALE_1_4') {
          adjustedScore = (score / 4) * weight;
        } else if (indicatorType === 'YES_NO') {
          adjustedScore = (score === 1 ? 1 : 0) * weight;
        }

        totalRawScore += score;
        totalAdjustedScore += adjustedScore;

        return {
          id: result.id,
          topicName: indicator.topic.name,
          indicatorName: indicator.name,
          indicatorType,
          weight,
          rawScore: score,
          adjustedScore: parseFloat(adjustedScore.toFixed(2))
        };
      });

      return {
        assignmentId: assignment.id,
        evaluator: assignment.evaluator,
        evaluatee: assignment.evaluatee,
        status: assignment.status,
        totalRawScore,
        totalAdjustedScore: parseFloat(totalAdjustedScore.toFixed(2)),
        results: resultsWithAdjustment
      };
    });

    return successResponse(res, reportData, "Evaluation report retrieved successfully");

  } catch (error) {
    next(error);
  }
};
