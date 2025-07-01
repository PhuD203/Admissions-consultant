// src/controllers/ExportController.ts
import { JsonController, Get, Res } from 'routing-controllers';
import type { Response } from 'express';
import ExcelJS from 'exceljs';
import {
  getStudent,
  getAllUser,
  getEnrollments,
} from '../services/data.service';

@JsonController('/export')
export class ExportController {
  @Get('/exceldata')
  async exportExcel(@Res() res: Response) {
    const buffer = await createStudentExcelBuffer();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=DataExcel.xlsx');
    res.send(buffer);
  }
}

const createStudentExcelBuffer = async () => {
  const workbook = new ExcelJS.Workbook();

  // ===== Sheet 1: Students =====
  const students = await getStudent();
  const studentSheet = workbook.addWorksheet('1. Students', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  studentSheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Tên học viên', key: 'student_name', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    {
      header: 'Môn học quan tâm',
      key: 'student_interested_courses',
      width: 30,
    },
    { header: 'SĐT', key: 'phone_number', width: 15 },
    { header: 'Zalo', key: 'zalo_phone', width: 15 },
    { header: 'Facebook', key: 'link_facebook', width: 25 },
    { header: 'Giới tính', key: 'gender', width: 10 },
    { header: 'Ngày sinh', key: 'date_of_birth', width: 15 },
    { header: 'Trình độ học vấn', key: 'current_education_level', width: 20 },
    { header: 'Trường cấp 3', key: 'high_school_name', width: 25 },
    { header: 'Tỉnh/TP', key: 'city', width: 15 },
    { header: 'Nguồn', key: 'source', width: 25 },
    { header: 'Đồng ý nhận tin', key: 'notification_consent', width: 25 },
    { header: 'Trạng thái hiện tại', key: 'current_status', width: 20 },
    { header: 'Tư vấn viên', key: 'assigned_counselor_id', width: 20 },
    { header: 'Ngày đổi trạng thái', key: 'status_change_date', width: 20 },
    { header: 'Ngày đăng ký', key: 'registration_date', width: 20 },
    { header: 'Ngày tạo', key: 'created_at', width: 20 },
    { header: 'Ngày cập nhật', key: 'updated_at', width: 20 },
  ];

  // Ghi dữ liệu
  students.forEach((s) => {
    const sourceValue =
      s.source === 'Other' && s.other_source_description
        ? s.other_source_description
        : s.source;

    const notificationValue =
      s.notification_consent === 'Other' &&
      s.other_notification_consent_description
        ? s.other_notification_consent_description
        : s.notification_consent;

    studentSheet.addRow({
      ...s,
      source: sourceValue,
      notification_consent: notificationValue,
      date_of_birth: s.date_of_birth?.toISOString().split('T')[0],
      status_change_date: s.status_change_date?.toISOString().split('T')[0],
      registration_date: s.registration_date?.toISOString().split('T')[0],
      created_at: s.created_at?.toISOString().split('T')[0],
      updated_at: s.updated_at?.toISOString().split('T')[0],
    });
  });

  // Styling
  styleSheet(studentSheet);

  // ===== Sheet 2: Users =====
  const users = await getAllUser();
  const userSheet = workbook.addWorksheet('2. Users', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  userSheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Tên đầy đủ', key: 'full_name', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Loại người dùng', key: 'user_type', width: 20 },
    { header: 'Ngày tạo', key: 'created_at', width: 20 },
    { header: 'Ngày cập nhật', key: 'updated_at', width: 20 },
  ];

  users.forEach((u) => {
    userSheet.addRow({
      ...u,
      created_at: u.created_at?.toISOString().split('T')[0],
      updated_at: u.updated_at?.toISOString().split('T')[0],
    });
  });

  styleSheet(userSheet);

  // ===== Sheet 3: Enrollments =====
  const enrollments = await getEnrollments();
  const enrollSheet = workbook.addWorksheet('3. Enrollments', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  enrollSheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Tên học viên', key: 'students', width: 25 },
    { header: 'Khóa học', key: 'courses', width: 25 },
    { header: 'Ngày ghi danh', key: 'enrollment_date', width: 20 },
    { header: 'Số tiền đã trả', key: 'fee_paid', width: 15 },
    { header: 'Trạng thái thanh toán', key: 'payment_status', width: 20 },
    { header: 'Tư vấn viên', key: 'counselor_id', width: 20 },
    { header: 'Buổi tư vấn', key: 'consultation_session_id', width: 20 },
    { header: 'Ghi chú', key: 'notes', width: 30 },
    { header: 'Ngày tạo', key: 'created_at', width: 20 },
    { header: 'Ngày cập nhật', key: 'updated_at', width: 20 },
  ];

  enrollments.forEach((e) => {
    enrollSheet.addRow({
      ...e,
      enrollment_date: e.enrollment_date?.toISOString().split('T')[0],
      created_at: e.created_at?.toISOString().split('T')[0],
      updated_at: e.updated_at?.toISOString().split('T')[0],
    });
  });

  styleSheet(enrollSheet);

  return await workbook.xlsx.writeBuffer();
};

function styleSheet(sheet: ExcelJS.Worksheet) {
  // Định dạng dòng tiêu đề (header row)
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDCE6F1' },
    };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Căn giữa mặc định cho tất cả các cột và wrap text
  sheet.columns?.forEach((column) => {
    column.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
  });

  // Căn giữa và chỉnh chiều cao cho tất cả các dòng
  sheet.eachRow((row, rowNumber) => {
    row.height = 22;
    row.eachCell((cell) => {
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
    });
  });
}
