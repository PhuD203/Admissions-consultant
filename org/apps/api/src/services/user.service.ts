// @ts-ignore
import { PrismaClient, User, users_status, users_user_type } from '@prisma/client';
import Paginator from './paginator';

import { CreateUserDto } from '../dtos/user/user.dto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient(); // Đảm bảo PrismaClient chỉ được khởi tạo một lần duy nhất

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

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // 1. Check if user with this email already exists
      const existingUser = await prisma.users.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        // Nên sử dụng một lỗi tùy chỉnh hoặc lỗi HTTP cụ thể cho NestJS
        throw new Error('Email đã được sử dụng.');
      }

      // 2. Hash the password before saving
      if (!userData.password) {
        throw new Error('Password is required.');
      }
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Xử lý employment_date
      let employmentDate: Date | undefined;
      if (userData.employment_date !== undefined && userData.employment_date !== null) {
        // Chuyển đổi chuỗi ngày thành đối tượng Date
        // Nếu userData.employment_date đã là Date object thì vẫn hoạt động tốt
        const parsedDate = new Date(userData.employment_date);
        // Kiểm tra xem parsedDate có phải là một ngày hợp lệ không
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid employment_date format. Expected a valid date string or Date object.');
        }
        employmentDate = parsedDate;
      }

      // 3. Create the user in the database
      const newUser = await prisma.users.create({
        data: {
          email: userData.email,
          password_hash: hashedPassword,
          full_name: userData.full_name,
          user_type: userData.user_type, // Đảm bảo kiểu này khớp với enum trong Prisma schema
          ...(userData.is_main_consultant !== undefined && { is_main_consultant: userData.is_main_consultant }),
          ...(userData.kpi_group_id !== undefined && { kpi_group_id: userData.kpi_group_id }),
          ...(employmentDate !== undefined && { employment_date: employmentDate }), // Sử dụng employmentDate đã được xử lý
          ...(userData.status !== undefined && { status: userData.status }), // Đảm bảo kiểu này khớp với enum trong Prisma schema
          // Nếu program_type cũng là một enum, hãy đảm bảo nó được ép kiểu đúng hoặc định nghĩa trong DTO
          // Ví dụ: program_type: userData.program_type as users_program_type, (nếu bạn có enum users_program_type)
          ...(userData.program_type !== undefined && { program_type: userData.program_type }),
        },
      });

      return newUser;
    } catch (error) {
      console.error("Error in UserService.createUser:", error);
      throw error; // Re-throw the error for controller handling
    }
  }
}

export default new UserService();