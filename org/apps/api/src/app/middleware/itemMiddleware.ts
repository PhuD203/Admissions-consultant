import { Request, Response, NextFunction } from 'express';

const data = [
  {
    student_id: 101,
    student_name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone_number: '0901234567',
    zalo_phone: '0901234567',
    link_facebook: 'https://facebook.com/nguyenvana',
    date_of_birth: '2005-01-15',
    current_education_level: 'THPT',
    other_education_level_description: null,
    high_school_name: 'THPT Phan Châu Trinh',
    city: 'Đà Nẵng',
    source: 'Fanpage',
    notification_consent: 'Đồng ý',
    current_status: 'Đang tương tác',
    status_change_date: '2024-03-10 10:00:00',
    registration_date: null,
    student_created_at: '2024-03-01 08:30:00',
    student_updated_at: '2024-05-20 15:00:00',
    assigned_counselor_name: 'Trần Thị B',
    assigned_counselor_type: 'tư vấn viên',
    interested_courses_details: 'Thiết kế Web và lập trình Front-end',
    enrolled_courses_details: null,
    student_status_history:
      'Từ: Tiềm năng Đến: Đang tương tác (Ngày: 2024-03-10 10:00:00, Bởi: Trần Thị B, Ghi chú: Chuyển trạng thái sau buổi tư vấn đầu tiên);\nTừ: null Đến: Tiềm năng (Ngày: 2024-03-01 08:30:00, Ghi chú: Tạo hồ sơ ban đầu)',
    last_consultation_date: '2024-05-15 14:00:00',
    last_consultation_duration_minutes: 45,
    last_consultation_notes:
      'Tư vấn về lộ trình học lập trình frontend và các yêu cầu đầu vào.',
    last_consultation_type: 'Họp trực tuyến',
    last_consultation_status: 'Hoàn thành',
    last_consultation_counselor_name: 'Trần Thị B',
  },
  {
    student_id: 102,
    student_name: 'Trung phu',
    email: 'phulx2003@gmail.com',
    phone_number: '0912345678',
    zalo_phone: null,
    link_facebook: null,
    date_of_birth: '2003-07-22',
    current_education_level: 'Sinh viên',
    other_education_level_description: 'Đại học Cần Thơ - CNTT',
    high_school_name: null,
    city: 'Cần Thơ',
    source: 'Website',
    notification_consent: 'Đồng ý',
    current_status: 'Đã đăng ký',
    status_change_date: '2024-04-05 09:15:00',
    registration_date: '2024-04-05',
    student_created_at: '2024-03-15 11:00:00',
    student_updated_at: '2024-05-20 16:30:00',
    assigned_counselor_name: 'Nguyễn Văn D',
    assigned_counselor_type: 'tư vấn viên',
    interested_courses_details: 'Thiết kế Web và lập trình Front-end',
    enrolled_courses_details:
      'Lập trình - Lập trình Python Cơ bản (Ngày đăng ký: 2024-04-05, Phí đã trả: 3000000.00, Trạng thái thanh toán: Đã thanh toán, Tư vấn viên đăng ký: Nguyễn Văn D)',
    student_status_history:
      'Từ: Đang tương tác Đến: Đã đăng ký (Ngày: 2024-04-05 09:15:00, Bởi: Nguyễn Văn D, Ghi chú: Hoàn tất đăng ký khóa học);\nTừ: Tiềm năng Đến: Đang tương tác (Ngày: 2024-03-20 15:30:00, Bởi: Nguyễn Văn D, Ghi chú: Chuyển trạng thái sau cuộc gọi);\nTừ: null Đến: Tiềm năng (Ngày: 2024-03-15 11:00:00, Ghi chú: Đăng ký qua website)',
    last_consultation_date: '2024-04-01 10:00:00',
    last_consultation_duration_minutes: 60,
    last_consultation_notes: 'Tư vấn chi tiết về khóa học Python và ưu đãi.',
    last_consultation_type: 'Cuộc gọi điện thoại',
    last_consultation_status: 'Hoàn thành',
    last_consultation_counselor_name: 'Nguyễn Văn D',
  },
  {
    student_id: 103,
    student_name: 'Lê Thị C',
    email: 'lethic@example.com',
    phone_number: '0912345678',
    zalo_phone: null,
    link_facebook: null,
    date_of_birth: '2003-07-22',
    current_education_level: 'Sinh viên',
    other_education_level_description: 'Đại học Cần Thơ - CNTT',
    high_school_name: null,
    city: 'Cần Thơ',
    source: 'Website',
    notification_consent: 'Đồng ý',
    current_status: 'Đã đăng ký',
    status_change_date: '2024-04-05 09:15:00',
    registration_date: '2024-04-05',
    student_created_at: '2024-03-15 11:00:00',
    student_updated_at: '2024-05-20 16:30:00',
    assigned_counselor_name: 'Nguyễn Văn D',
    assigned_counselor_type: 'tư vấn viên',
    interested_courses_details: 'Thiết kế Web và lập trình Front-end',
    enrolled_courses_details:
      'Lập trình - Lập trình Python Cơ bản (Ngày đăng ký: 2024-04-05, Phí đã trả: 3000000.00, Trạng thái thanh toán: Đã thanh toán, Tư vấn viên đăng ký: Nguyễn Văn D)',
    student_status_history:
      'Từ: Đang tương tác Đến: Đã đăng ký (Ngày: 2024-04-05 09:15:00, Bởi: Nguyễn Văn D, Ghi chú: Hoàn tất đăng ký khóa học);\nTừ: Tiềm năng Đến: Đang tương tác (Ngày: 2024-03-20 15:30:00, Bởi: Nguyễn Văn D, Ghi chú: Chuyển trạng thái sau cuộc gọi);\nTừ: null Đến: Tiềm năng (Ngày: 2024-03-15 11:00:00, Ghi chú: Đăng ký qua website)',
    last_consultation_date: '2024-04-01 10:00:00',
    last_consultation_duration_minutes: 60,
    last_consultation_notes: 'Tư vấn chi tiết về khóa học Python và ưu đãi.',
    last_consultation_type: 'Cuộc gọi điện thoại',
    last_consultation_status: 'Hoàn thành',
    last_consultation_counselor_name: 'Nguyễn Văn D',
  },
];

export const isDuplicate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data_ = req.body;
  const parts = data_.interested_courses_details.split('___');

  const exists = data.some(
    (item) =>
      removeVietnameseTones(item.student_name) ===
        removeVietnameseTones(data_.student_name) &&
      item.email === data_.email &&
      item.interested_courses_details === parts[1]
  );

  if (!exists) {
    return next();
  } else {
    return res.status(200).json({
      message: 'Email đã được gửi',
    });
  }
};

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD') // Tách dấu ra khỏi ký tự
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
    .replace(/đ/g, 'd') // Thay 'đ' bằng 'd'
    .replace(/Đ/g, 'D') // Thay 'Đ' bằng 'D'
    .replace(/\s+/g, ' ') // Chuẩn hóa khoảng trắng
    .toLowerCase()
    .trim(); // Xóa khoảng trắng đầu/cuối
}
