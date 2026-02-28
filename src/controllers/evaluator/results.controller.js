import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const submitResults = async (req, res, next) => {
  try {
    const evaluatorId = req.user.id;
    const { assignmentId, scores } = req.body; // scores: [{ indicatorId: "id", score: 4 }]

    // 1. ดึงข้อมูล Assignment พร้อมกับ Topic และ Indicator ทั้งหมดเพื่อใช้นับจำนวน
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        evaluation: {
          include: {
            topics: {
              include: {
                indicators: true // ดึงตัวชี้วัดทั้งหมดมาด้วยเพื่อเช็คความครบถ้วน
              }
            }
          }
        }
      },
    });

    if (!assignment) {
      return errorResponse(res, "Assignment not found", 404);
    }

    if (assignment.evaluatorId !== evaluatorId) {
      return errorResponse(res, "You are not the assigned evaluator", 403);
    }

    const evaluateeId = assignment.evaluateeId;
    const indicatorIds = scores.map(s => s.indicatorId);

    // --- ส่วนที่ 1: ตรวจสอบเรื่องหลักฐาน (Evidence Validation) ---
    const indicators = await prisma.indicator.findMany({
      where: { id: { in: indicatorIds } }
    });

    const evidences = await prisma.indicatorEvidence.findMany({
      where: {
        evaluateeId: evaluateeId,
        indicatorId: { in: indicatorIds }
      }
    });

    const indicatorsWithEvidence = new Set(evidences.map(e => e.indicatorId));

    for (const indicator of indicators) {
      if (indicator.requireEvidence && !indicatorsWithEvidence.has(indicator.id)) {
        return res.status(400).json({
          success: false,
          message: `ไม่สามารถบันทึกได้: ตัวชี้วัด "${indicator.name}" จำเป็นต้องแนบหลักฐานประกอบ`
        });
      }
    }

    // --- ส่วนที่ 2: บันทึกคะแนน (Save Results) ---
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

    // --- ส่วนที่ 3: ตรวจสอบความครบถ้วนเพื่อเปลี่ยน Status ---
    // นับจำนวนตัวชี้วัดทั้งหมดที่มีในแบบประเมินนี้
    let totalIndicatorsCount = 0;
    assignment.evaluation.topics.forEach(topic => {
      totalIndicatorsCount += topic.indicators.length;
    });

    // ถ้าผู้ประเมินส่งคะแนนมาเท่ากับ หรือมากกว่า จำนวนตัวชี้วัดทั้งหมด -> ถือว่าเสร็จสิ้น (COMPLETED)
    // ถ้าส่งมาไม่ครบ (เป็นการทยอยบันทึกร่าง) -> สถานะยังคงเป็น PENDING
    const newStatus = scores.length >= totalIndicatorsCount ? 'COMPLETED' : 'PENDING';

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: newStatus },
    });

    return successResponse(
      res,
      { status: newStatus, savedCount: scores.length, totalCount: totalIndicatorsCount },
      "Evaluation results submitted successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};