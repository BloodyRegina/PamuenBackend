import prisma from "../../prisma/client.js";
import { successResponse } from "../../utils/response.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let data = {};

    if (role === "ADMIN") {
      // ดึงข้อมูลสำหรับ Admin
      const totalEvaluations = await prisma.evaluation.count();
      const totalEvaluators = await prisma.user.count({ where: { role: "EVALUATOR" } });
      const totalEvaluatees = await prisma.user.count({ where: { role: "EVALUATEE" } });
      
      data = { totalEvaluations, totalEvaluators, totalEvaluatees };
      
    } else if (role === "EVALUATOR") {
      // ดึงข้อมูลจำนวนการประเมินที่ผู้ประเมินได้รับมอบหมาย
      // ทางเลือก: หากต้องการนับเฉพาะที่ "ยังไม่ประเมิน (PENDING)" ให้เพิ่มเงื่อนไข status: "PENDING"
      const totalAssignments = await prisma.assignment.count({ 
        where: { evaluatorId: id } 
      });
      data = { totalAssignments };

    } else if (role === "EVALUATEE") {
      // ดึงข้อมูลจำนวนแบบประเมินที่ผู้รับการประเมินต้องถูกประเมิน
      const totalEvaluations = await prisma.assignment.count({ 
        where: { evaluateeId: id } 
      });
      data = { totalEvaluations };
    }

    return successResponse(res, data, "Dashboard stats retrieved successfully");
  } catch (error) {
    next(error);
  }
};