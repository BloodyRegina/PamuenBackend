import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const createIndicator = async (req, res, next) => {
  try {
    const { topicId, name, description, indicatorType, requireEvidence, weight } = req.body;
    const newWeight = parseFloat(weight);

    // ให้ Prisma รวมค่าน้ำหนักเดิมทั้งหมดใน Topic นี้มาให้
    const aggregate = await prisma.indicator.aggregate({
      where: { topicId },
      _sum: { weight: true }
    });

    const currentTotalWeight = aggregate._sum.weight || 0;

    // ตรวจสอบว่า ถ้าน้ำหนักเดิม + น้ำหนักใหม่ เกิน 100 ให้ตีกลับทันที
    if (currentTotalWeight + newWeight > 100) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถเพิ่มตัวชี้วัดได้ เนื่องจากน้ำหนักรวมจะเกิน 100% (ปัจจุบันมีอยู่ ${currentTotalWeight}%, กำลังจะเพิ่มอีก ${newWeight}%)`
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
// เพิ่มต่อท้ายไฟล์เดิม
export const updateIndicator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, indicatorType, requireEvidence, weight } = req.body;

    // ถ้ามีการส่งค่าน้ำหนักมาเพื่ออัปเดต ต้องเช็คผลรวมด้วย
    if (weight !== undefined) {
      const newWeight = parseFloat(weight);
      
      // ดึงข้อมูลตัวชี้วัดปัจจุบันเพื่อหาว่าอยู่ใน Topic ไหน
      const currentIndicator = await prisma.indicator.findUnique({ where: { id } });
      
      // ให้ Prisma รวมค่าน้ำหนักใน Topic นี้ **โดยยกเว้นค่าน้ำหนักของตัวเองที่กำลังจะถูกแก้**
      const aggregate = await prisma.indicator.aggregate({
        where: { 
          topicId: currentIndicator.topicId,
          id: { not: id } 
        },
        _sum: { weight: true }
      });

      const otherTotalWeight = aggregate._sum.weight || 0;

      if (otherTotalWeight + newWeight > 100) {
        return res.status(400).json({
          success: false,
          message: `แก้ไขน้ำหนักไม่สำเร็จ! รวมแล้วเกิน 100% (ข้ออื่นๆ รวมกันได้ ${otherTotalWeight}%, คุณพยายามใส่ ${newWeight}%)`
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