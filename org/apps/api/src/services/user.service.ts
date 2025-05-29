// @ts-ignore
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();
import Paginator from './paginator';

class UserService {

  async getAllUsers(page: number | string, limit: number | string): Promise<{ users: User[], metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const totalUsersCount = await prisma.users.count();


      const users = await prisma.users.findMany({
        skip: paginator.offset,
        take: paginator.limit,
      });

      const metadata = paginator.getMetadata(totalUsersCount);

      return {
        users,
        metadata,
      };
    } catch (e) {
      console.error("Error in UserService.getAllUsers:", e);
      return null;
    }
  }
}

export default new UserService();
