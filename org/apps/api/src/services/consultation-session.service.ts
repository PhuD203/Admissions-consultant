import { PrismaClient, consultationsessions } from '@prisma/client';
import Paginator from './paginator';
import { CreateConsultationSessionDto } from '../dtos/consultationsession/create-consultation-session.dto';

const prisma = new PrismaClient();

class ConsultationSessionService {
  async getAllConsultationSessions(page: number | string = 1, limit: number | string = 10): Promise<{ consultationSessions: consultationsessions[], metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const [totalCount, consultationSessions] = await Promise.all([
        prisma.consultationsessions.count(),
        prisma.consultationsessions.findMany({
          skip: paginator.offset,
          take: paginator.limit,
          include: {
            users: true,
            students: true
          }
        })
      ]);

      const metadata = paginator.getMetadata(totalCount);
      return { consultationSessions, metadata };
    } catch (e) {
      console.error("Error in ConsultationSessionService.getAllConsultationSessions:", e);
      return null;
    }
  }

  async getConsultationSessionById(id: number): Promise<consultationsessions | null> {
    try {
      return await prisma.consultationsessions.findUnique({
        where: { id },
        include: {
          users: true,
          students: true
        }
      });
    } catch (e) {
      console.error("Error in ConsultationSessionService.getConsultationSessionById:", e);
      return null;
    }
  }

  async createConsultationSession(data: CreateConsultationSessionDto): Promise<consultationsessions | null> {
    try {
      return await prisma.consultationsessions.create({
        data
      });
    } catch (e) {
      console.error("Error in ConsultationSessionService.createConsultationSession:", e);
      return null;
    }
  }

  async updateConsultationSession(id: number, data: any): Promise<consultationsessions | null> {
    try {
      return await prisma.consultationsessions.update({
        where: { id },
        data
      });
    } catch (e) {
      console.error("Error in ConsultationSessionService.updateConsultationSession:", e);
      return null;
    }
  }

  async deleteConsultationSession(id: number): Promise<void> {
    try {
      await prisma.consultationsessions.delete({
        where: { id }
      });
    } catch (e) {
      console.error("Error in ConsultationSessionService.deleteConsultationSession:", e);
    }
  }
}

export default new ConsultationSessionService();
