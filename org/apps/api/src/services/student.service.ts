// @ts-ignore
import { PrismaClient, students } from '@prisma/client';
import Paginator from './paginator';
import { StudentCreateDTO } from '../dtos/student/student-create.dto';
import { StudentUpdateDTO } from '../dtos/student/student-update.dto';

const prisma = new PrismaClient();

class StudentService {
  async getAllStudents(
    page: number | string = 1,
    limit: number | string = 10
  ): Promise<{ students: students[]; metadata: any } | null> {
    // CORRECTED: Use 'students[]' as the type
    try {
      const paginator = new Paginator(page, limit);

      const [totalStudentsCount, students] = await Promise.all([
        prisma.students.count(),
        prisma.students.findMany({
          skip: paginator.offset,
          take: paginator.limit,
        }),
      ]);

      const metadata = paginator.getMetadata(totalStudentsCount);
      return {
        students,
        metadata,
      };
    } catch (e) {
      console.error('Error in StudentService.getAllStudents:', e);
      return null;
    }
  }

  async getStudentById(studentId: number): Promise<students | null> {
    try {
      return await prisma.students.findUnique({
        where: {
          id: studentId,
        },
      });
    } catch (e) {
      console.error('Error in StudentService.getStudentById:', e);
      return null;
    }
  }

  async deleteStudent(studentId: number): Promise<void> {
    try {
      await prisma.students.delete({
        where: {
          id: studentId,
        },
      });
    } catch (e) {
      console.error('Error in StudentService.getStudentById:', e);
    }
  }

  async createStudent(studentDTO: StudentCreateDTO): Promise<void> {
    try {
      await prisma.students.create({
        data: studentDTO,
      });
    } catch (e) {
      console.error('Error in StudentService.createStudent:', e);
    }
  }

  async updateStudent(
    id: number,
    student: StudentUpdateDTO
  ): Promise<students | null> {
    const existStudent = await prisma.students.findUnique({
      where: {
        id: id,
      },
    });
    if (!existStudent) {
      return null;
    }
    try {
      return await prisma.students.update({
        where: {
          id: id,
        },
        data: student,
      });
    } catch (e) {
      console.error('Error in StudentService.updateStudent:', e);
      return null;
    }
  }

  async getMaxStudentId() {
    const result = await prisma.students.aggregate({
      _max: {
        id: true,
      },
    });

    return result._max.id;
  }
}

export default new StudentService();
