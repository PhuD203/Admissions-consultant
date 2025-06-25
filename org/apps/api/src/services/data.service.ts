import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllStudentsOnly = async () => {
  const students = await prisma.students.findMany({
    include: {
      student_interested_courses: {
        include: {
          courses: true, // lấy thông tin khóa học
        },
      },
    },
  });
  return students.map((s) => ({
    id: s.id,
    student_name: s.student_name,
    email: s.email,
    phone_number: s.phone_number,
    gender: s.gender,
    registration_date: s.registration_date,
    interested_courses_details: s.student_interested_courses
      .map((ic) => ic.courses?.name)
      .filter(Boolean) // loại bỏ null nếu có
      .join(', '), // ghép thành chuỗi
  }));
};
