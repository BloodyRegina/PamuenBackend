import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const createIndicator = async (req, res, next) => {
  try {
    const { topicId, name, description, indicatorType, requireEvidence, weight } = req.body;
    const newWeight = parseFloat(weight);

    // 1. ดึงข้อมูล Topic ปัจจุบันเพื่อให้ทราบว่าอยู่ในการประเมิน (Evaluation) ใด
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { evaluationId: true }
    });

    if (!topic) {
      return res.status(404).json({ success: false, message: "ไม่พบหัวข้อประเมิน (Topic)" });
    }

    // 2. ให้ Prisma รวมค่าน้ำหนักเดิมทั้งหมดของการประเมินนี้ (ทุก Topic ที่อยู่ใต้ evaluationId เดียวกัน)
    const aggregate = await prisma.indicator.aggregate({
      where: { 
        topic: {
          evaluationId: topic.evaluationId
        }
      },
      _sum: { weight: true }
    });

    const currentTotalWeight = aggregate._sum.weight || 0;

    // 3. ตรวจสอบว่า ถ้าน้ำหนักเดิม + น้ำหนักใหม่ เกิน 100 ให้ตีกลับทันที
    if (currentTotalWeight + newWeight > 100) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถเพิ่มตัวชี้วัดได้ เนื่องจากน้ำหนักรวมของการประเมินจะเกิน 100% (ปัจจุบันมีอยู่ ${currentTotalWeight}%, กำลังจะเพิ่มอีก ${newWeight}%)`
      });
    }

    const indicator = await prisma.indicator.create({
      data: {
        topicId,
        name,
        description,
        indicatorType,
        requireEvidence,
        weight: newWeight,
      },
    });

    return successResponse(res, indicator, "Indicator created successfully", 201);
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

export const updateIndicator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, indicatorType, requireEvidence, weight } = req.body;

    // ถ้ามีการส่งค่าน้ำหนักมาเพื่ออัปเดต ต้องเช็กผลรวมด้วย
    if (weight !== undefined) {
      const newWeight = parseFloat(weight);
      
      // 1. ดึงข้อมูลตัวชี้วัดปัจจุบัน พร้อมดึง topic.evaluationId มาด้วย
      const currentIndicator = await prisma.indicator.findUnique({ 
        where: { id },
        include: { topic: { select: { evaluationId: true } } }
      });

      if (!currentIndicator) {
        return res.status(404).json({ success: false, message: "ไม่พบตัวชี้วัดนี้" });
      }
      
      // 2. ให้ Prisma รวมค่าน้ำหนักใน Evaluation นี้ทั้งหมด **โดยยกเว้นค่าน้ำหนักของตัวเองที่กำลังจะถูกแก้**
      const aggregate = await prisma.indicator.aggregate({
        where: { 
          topic: {
            evaluationId: currentIndicator.topic.evaluationId
          },
          id: { not: id } 
        },
        _sum: { weight: true }
      });

      const otherTotalWeight = aggregate._sum.weight || 0;

      if (otherTotalWeight + newWeight > 100) {
        return res.status(400).json({
          success: false,
          message: `แก้ไขน้ำหนักไม่สำเร็จ! รวมแล้วน้ำหนักทั้งการประเมินจะเกิน 100% (ข้ออื่นๆ รวมกันได้ ${otherTotalWeight}%, คุณพยายามใส่ ${newWeight}%)`
        });
      }
    }

    const indicator = await prisma.indicator.update({
      where: { id },
      data: { 
        name, 
        description, 
        indicatorType, 
        requireEvidence, 
        weight: weight !== undefined ? parseFloat(weight) : undefined 
      },
    });

    return successResponse(res, indicator, "Indicator updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteIndicator = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.indicator.delete({
      where: { id },
    });

    return successResponse(res, null, "Indicator deleted successfully");
  } catch (error) {
    next(error);
  }
};