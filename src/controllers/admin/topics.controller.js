import prisma from "../../prisma/client.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const createTopic = async (req, res, next) => {
  try {
    const { evaluationId, name, description } = req.body;

    const topic = await prisma.topic.create({
      data: {
        evaluationId,
        name,
        description,
        createdBy: req.user.id,
      },
    });

    return successResponse(res, topic, "Topic created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getTopics = async (req, res, next) => {
  try {
    const { evaluationId } = req.query;

    const where = {};
    if (evaluationId) {
      where.evaluationId = evaluationId;
    }

    const topics = await prisma.topic.findMany({
      where,
      include: {
        indicators: true,
      },
    });
    return successResponse(res, topics, "Topics retrieved successfully");
  } catch (error) {
    next(error);
  }
};
export const updateTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const topic = await prisma.topic.update({
      where: { id },
      data: { name, description },
    });

    return successResponse(res, topic, "Topic updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // ลบ Topic (ตัว Indicator และข้อมูลที่เกี่ยวข้องจะถูกลบไปด้วยจาก Cascade Delete ที่เราทำไว้)
    await prisma.topic.delete({
      where: { id },
    });

    return successResponse(res, null, "Topic deleted successfully");
  } catch (error) {
    next(error);
  }
};