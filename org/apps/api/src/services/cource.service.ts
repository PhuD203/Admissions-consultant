import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Lấy danh sách các khóa học cùng với lớp học tương ứng.
 */
export async function getCourseCategories() {
  const courses = await prisma.khoahoc.findMany({
    include: { khoahoc_lop: true },
  });

  const formattedCourses = await Promise.all(
    courses.map(async (course) => {
      const courseLevels = await Promise.all(
        course.khoahoc_lop.map(async (level) => {
          const classes = await prisma.lop.findMany({
            where: { ID_KhoaHoc_Lop: level.ID },
          });

          return {
            id: level.ID,
            name: level.Name || '',
            class: classes.map((cls) => ({ name: cls.Name || '' })),
          };
        })
      );

      return {
        title: course.Name || '',
        course: courseLevels,
      };
    })
  );

  return formattedCourses;
}

/**
 * API trả về JSON các danh mục khóa học và lớp học.
 */
export const courseCategoryController = async (req: Request, res: Response) => {
  try {
    const data = await getCourseCategories();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching course categories:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
