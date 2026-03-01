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

    const evidence = await prisma.indicatorEvidence.create({
      data: {
        indicatorId,
        evaluateeId,
        filename,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
      },
    });

    return successResponse(res, evidence, "Evidence uploaded successfully", 201);
  } catch (error) {
    if (error.code === "P2002") {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(409).json({ 
        success: false, 
        message: "Conflict: ผู้รับการประเมินรายนี้ได้ส่งหลักฐานสำหรับตัวชี้วัดนี้ไปแล้ว" 
      });
    }
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