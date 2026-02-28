import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import fs from "fs";
import path from "path";

export const uploadEvidence = async (req, res, next) => {
  try {
    const evaluateeId = req.user.id;
    const { indicatorId } = req.body;

    // ตรวจสอบว่ามีไฟล์ส่งมาหรือไม่
    if (!req.file) {
      // ปรับมาใช้ res.status(400).json แทน errorResponse ถ้าไม่ได้ปรับ errorResponse ให้รองรับ
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filename = req.file.filename;

    // 1. ค้นหาว่าเคยมีการอัปโหลดไฟล์สำหรับตัวชี้วัดข้อนี้ไปแล้วหรือยัง
    const existingEvidence = await prisma.indicatorEvidence.findFirst({
      where: {
        indicatorId,
        evaluateeId,
      },
    });

    if (existingEvidence) {
      // 2. ถ้ามีไฟล์เก่า ให้ทำการลบไฟล์เก่าออกจากโฟลเดอร์ uploads (Physical Delete)
      const oldFilePath = path.join(process.cwd(), "uploads", existingEvidence.filename);
      
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath); // ลบไฟล์เก่าทิ้ง
      }

      // 3. อัปเดต Database ให้ชี้ไปที่ชื่อไฟล์ใหม่
      const updatedEvidence = await prisma.indicatorEvidence.update({
        where: { id: existingEvidence.id },
        data: { filename },
      });

      return successResponse(res, updatedEvidence, "Evidence updated and old file replaced successfully", 200);
    }

    // 4. กรณีที่ยังไม่เคยอัปโหลด ให้สร้างเรคคอร์ดใหม่
    const evidence = await prisma.indicatorEvidence.create({
      data: {
        indicatorId,
        evaluateeId,
        filename,
      },
    });

    return successResponse(res, evidence, "Evidence uploaded successfully", 201);
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
export const deleteEvidence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluateeId = req.user.id;

    // ค้นหาหลักฐานว่ามีอยู่จริงและเป็นของคนๆ นี้
    const evidence = await prisma.indicatorEvidence.findFirst({
      where: { id, evaluateeId },
    });

    if (!evidence) {
      return res.status(404).json({ success: false, message: "Evidence not found or unauthorized" });
    }

    // ลบไฟล์ออกจาก Server
    const filePath = path.join(process.cwd(), "uploads", evidence.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // ลบข้อมูลออกจาก Database
    await prisma.indicatorEvidence.delete({
      where: { id },
    });

    return successResponse(res, null, "Evidence deleted successfully");
  } catch (error) {
    next(error);
  }
};