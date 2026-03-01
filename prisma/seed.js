import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up old data...");
  // ลบข้อมูลที่เกี่ยวข้องกันก่อน (ลบจากล่างขึ้นบนตามความสัมพันธ์)
  await prisma.indicatorResult.deleteMany();
  await prisma.indicatorEvidence.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.evaluation.deleteMany();

  // ลบข้อมูล User และ Department
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log("Seeding new data...");
  const passwordHash = await bcrypt.hash("password123", 10);

  // สร้าง Department
  const dept = await prisma.department.create({
    data: { name: "Information Technology" },
  });

  // สร้าง User Roles: Admin, Evaluator, Evaluatee
  const admin = await prisma.user.create({
    data: {
      empId: "ADMIN01",
      email: "admin@test.com",
      name: "Admin",
      password: passwordHash,
      role: "ADMIN", // ตรงกับ Enum
      departmentId: dept.id,
    },
  });

  const evaluator = await prisma.user.create({
    data: {
      empId: "EVA01",
      email: "eva@test.com",
      name: "Evaluator",
      password: passwordHash,
      role: "EVALUATOR", // ตรงกับ Enum
      departmentId: dept.id,
    },
  });

  const evaluatee = await prisma.user.create({
    data: {
      empId: "TEE01",
      email: "tee@test.com",
      name: "Evaluatee",
      password: passwordHash,
      role: "EVALUATEE", // ตรงกับ Enum
      departmentId: dept.id,
    },
  });

  // สร้าง Evaluation (ครอบคลุมข้อ A, B, C)
  const currentYear = new Date().getFullYear();
  const evaluation = await prisma.evaluation.create({
    data: {
      name: `การประเมินบุคลากร ประจำปี ${currentYear}`,
      startDate: new Date(`${currentYear}-01-01T00:00:00Z`),
      endDate: new Date(`${currentYear}-12-31T23:59:59Z`),
      createdBy: admin.id,
      status: "OPEN", // ตั้งเป็น OPEN เพื่อให้พร้อมทดสอบประเมินได้ทันที
    },
  });

  console.log("Evaluation Created with OPEN status");

  // Assignment (การมอบหมาย Evaluator ตรวจ Evaluatee)
  await prisma.assignment.create({
    data: {
      evaluationId: evaluation.id,
      evaluatorId: evaluator.id,
      evaluateeId: evaluatee.id,
      status: "PENDING", 
    },
  });

  console.log("Assignment Created");

  // หัวข้อการประเมินที่ 1: ความสำเร็จของงานตามแผน
  const topic1 = await prisma.topic.create({
    data: {
      name: "1. ความสำเร็จของงานตามแผน",
      description: "ประเมินเป้าหมายหลักตามแผนงาน",
      evaluationId: evaluation.id,
      createdBy: admin.id,
    },
  });

  // ตัวชี้วัด 1.a
  await prisma.indicator.create({
    data: {
      name: "a. ระบบ AI Agent (40%)",
      description:
        "ระดับ 4: เสร็จภายใน 31 ธ.ค. 69\nระดับ 3: เสร็จภายใน 15 ม.ค. 70\nระดับ 2: เสร็จภายใน 31 ม.ค. 70\nระดับ 1: เสร็จหลังวันที 31 ม.ค. 70",
      indicatorType: "SCALE_1_4", // แก้ให้ตรงกับ Enum
      requireEvidence: true,
      weight: 40.0,
      topicId: topic1.id,
    },
  });

  // ตัวชี้วัด 1.b
  await prisma.indicator.create({
    data: {
      name: "b. ระบบ Common report (25%)",
      description: "ต้องเสร็จภายใน 31 มี.ค. 2569",
      indicatorType: "SCALE_1_4", // แก้ให้ตรงกับ Enum
      requireEvidence: true,
      weight: 25.0,
      topicId: topic1.id,
    },
  });

  // หัวข้อการประเมินที่ 2: ความสำเร็จของงานประจำ
  const topic2 = await prisma.topic.create({
    data: {
      name: "2. ความสำเร็จของงานประจำ",
      description: "ประเมินการทำงานประจำทั่วไป (ส่วนน้ำหนักที่เหลือประมาณ 27%)",
      evaluationId: evaluation.id,
      createdBy: admin.id,
    },
  });

  // ตัวชี้วัดงานประจำ
  await prisma.indicator.create({
    data: {
      name: "ความสำเร็จของงานประจำโดยรวม",
      description: "ประเมินตามภาระงานที่ได้รับมอบหมาย",
      indicatorType: "SCALE_1_4", // แก้ให้ตรงกับ Enum
      requireEvidence: false,
      weight: 27.0,
      topicId: topic2.id,
    },
  });

  // หัวข้อการประเมินที่ 3: กิจกรรมในหน่วยงาน
  const topic3 = await prisma.topic.create({
    data: {
      name: "3. กิจกรรมในหน่วยงาน",
      description: "ประเมินการเข้าร่วมกิจกรรมขององค์กร",
      evaluationId: evaluation.id,
      createdBy: admin.id,
    },
  });

  // ตัวชี้วัด 3.a
  await prisma.indicator.create({
    data: {
      name: "a. เข้าร่วมกิจกรรมจิตอาสาของหน่วยงาน (3%)",
      description: "[y/n]",
      indicatorType: "YES_NO", // แก้ให้ตรงกับ Enum
      requireEvidence: true,
      weight: 3.0,
      topicId: topic3.id,
    },
  });

  // ตัวชี้วัด 3.b
  await prisma.indicator.create({
    data: {
      name: "b. ร่วมทำบุญในวันสำคัญของบริษัท (3%)",
      description: "[y/n]",
      indicatorType: "YES_NO", // แก้ให้ตรงกับ Enum
      requireEvidence: true,
      weight: 3.0,
      topicId: topic3.id,
    },
  });

  // ตัวชี้วัด 3.c
  await prisma.indicator.create({
    data: {
      name: "c. ไป Outing กับบริษัท (2%)",
      description: "[y/n]",
      indicatorType: "YES_NO", // แก้ให้ตรงกับ Enum
      requireEvidence: true,
      weight: 2.0,
      topicId: topic3.id,
    },
  });

  console.log("Seeding Topics and Indicators successfully.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });