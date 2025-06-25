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

export const getCountIdStudent = async () => {
  const maxStudent = await prisma.students.findFirst({
    orderBy: {
      id: 'desc', // Sắp xếp theo ID giảm dần
    },
    select: {
      id: true, // Chỉ lấy trường id
    },
  });

  const maxId = maxStudent?.id ?? 0; // Nếu không có bản ghi nào thì gán là 0
  console.log('Max student ID:', maxId);

  return maxId;
};

export const getStudent = async () => {
  const students = await prisma.students.findMany({
    include: {
      student_interested_courses: {
        include: {
          courses: true,
        },
      },
      studentstatushistory: {
        orderBy: { change_date: 'desc' },
        take: 1,
      },
      users: true, // Lấy thông tin tư vấn viên gán cho học viên
    },
  });

  const result = students.map((student) => ({
    id: student.id,
    student_name: student.student_name,
    email: student.email,
    phone_number: student.phone_number,
    gender: student.gender,
    zalo_phone: student.zalo_phone,
    link_facebook: student.link_facebook,
    date_of_birth: student.date_of_birth,
    current_education_level: student.current_education_level,
    other_education_level_description:
      student.other_education_level_description,
    high_school_name: student.high_school_name,
    city: student.city,
    source: student.source,
    other_source_description: student.other_source_description,
    notification_consent: student.notification_consent,
    other_notification_consent_description:
      student.other_notification_consent_description,
    current_status: student.current_status,
    assigned_counselor_id: student.users?.full_name || '', // ← Tên tư vấn viên
    status_change_date: student.status_change_date,
    registration_date: student.registration_date,
    created_at: student.created_at,
    updated_at: student.updated_at,
    student_interested_courses: student.student_interested_courses
      .map((s) => s.courses.name)
      .join(', '),
  }));

  return result;
};

export const getAllUser = async () => {
  const users = await prisma.users.findMany({});

  return users;
};

export const getEnrollments = async () => {
  const enrollments = await prisma.studentenrollments.findMany({
    include: {
      students: true,
      courses: true,
      users: true, // Thêm để lấy thông tin tư vấn viên
    },
  });

  return enrollments.map((e) => ({
    id: e.id,
    student_id: e.student_id,
    course_id: e.course_id,
    students: e.students.student_name,
    courses: e.courses.name,
    enrollment_date: e.enrollment_date,
    fee_paid: e.fee_paid.toNumber(),
    payment_status: e.payment_status,
    counselor_id: e.users?.full_name || '', // ← Chuyển từ ID sang tên
    consultation_session_id: e.consultation_session_id,
    notes: e.notes,
    created_at: e.created_at,
    updated_at: e.updated_at,
  }));
};
