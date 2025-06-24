// src/middlewares/duplicate-check.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';

const mockData = [
  {
    student_id: 101,
    student_name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
    interested_courses_details:
      'SomeCourse___Thiết kế Web và lập trình Front-end',
    registration_date: '01:52:16 17/6/2025',
  },
];

@Middleware({ type: 'before' })
export class DuplicateCheckMiddleware implements ExpressMiddlewareInterface {
  use(req: Request, res: Response, next: NextFunction): any {
    const data_ = req.body;
    console.log('DUPLICATE_MIDDLEWARE: BODY =', data_);

    if (!data_?.interested_courses_details || !data_?.registration_date) {
      return next();
    }

    const parts = data_.interested_courses_details.split('___');
    if (parts.length < 2) return next();

    const [timePart2, datePart2] = data_.registration_date.split(' ');
    const [hour2, minute2, second2] = timePart2.split(':').map(Number);
    const [day2, month2, year2] = datePart2.split('/').map(Number);

    const currentDate = new Date(
      year2,
      month2 - 1,
      day2,
      hour2,
      minute2,
      second2
    );
    currentDate.setHours(0, 0, 0, 0);

    const exists = mockData.some((item) => {
      const [timePart, datePart] = item.registration_date.split(' ');
      const [hour, minute, second] = timePart.split(':').map(Number);
      const [day, month, year] = datePart.split('/').map(Number);

      const oldDate = new Date(year, month - 1, day, hour, minute, second);
      const expiryDate = new Date(oldDate);
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      expiryDate.setHours(0, 0, 0, 0);

      return (
        removeVietnameseTones(item.student_name) ===
          removeVietnameseTones(data_.student_name) &&
        item.email === data_.email &&
        item.interested_courses_details === parts[1] &&
        currentDate < expiryDate
      );
    });

    if (!exists) {
      return next();
    } else {
      console.log('DUPLICATE_MIDDLEWARE: Duplicate found');
      return res.status(200).json({ message: 'Email đã được gửi' });
    }
  }
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}
