// @ts-ignore
import {PrismaClient, studentstatushistory} from '@prisma/client';
import Paginator from "./paginator";


const prisma = new PrismaClient();

class StudentStatusHistoryService {

  async getAllStudentStatus(page: number | string = 1, limit: number | string = 10): Promise<{ student_status_history: studentstatushistory[], metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);


      const [totalStudentsCount, student_status_history] = await Promise.all([
        prisma.studentstatushistory.count(),
        prisma.studentstatushistory.findMany({
          skip: paginator.offset,
          take: paginator.limit,
        })])

      const metadata = paginator.getMetadata(totalStudentsCount);
      return {
        student_status_history,
        metadata,
      };
    } catch (e) {
      console.error("Error in StudentService.getAllStudents:", e);
      return null;
    }
  }

}

export default new StudentStatusHistoryService();
