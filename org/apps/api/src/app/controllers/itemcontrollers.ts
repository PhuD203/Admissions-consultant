import { Request, Response } from 'express';
import { SendEmail } from '../email/emailsender';
import axios from 'axios';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PostForm(req: Request, res: Response) {
  const formData = req.body;
  // const parts = formData.interested_courses_details.split('___');
  const getMax = await getMaxStudentId();
  const countId = (getMax ?? 0) + 1;

  let highschool = formData.high_school_name;
  if (
    formData.current_education_level.includes('Học sinh THPT') ||
    formData.current_education_level.includes('Sinh viên')
  ) {
    highschool = 'Đã tốt nghiệp';
  } else if (highschool === '') {
    highschool = 'Null';
  }

  let notification_consent = '';
  if (formData.notification_consent === 'Đồng ý') {
    notification_consent = 'Agree';
  } else if (formData.notification_consent === 'Khác') {
    notification_consent = 'Other';
  }

  const inputData = [
    {
      id: countId,
      student_name: formData.student_name,
      email: formData.email,
      phone_number: formData.phone_number,
      zalo_phone:
        formData.zalo_phone === ''
          ? formData.phone_number
          : formData.zalo_phone,
      link_facebook:
        formData.link_facebook === '' ? 'Null' : formData.link_facebook,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      current_education_level: formData.current_education_level,
      other_education_level_description:
        formData.other_education_level_description,
      high_school_name: highschool,
      city: formData.city === '' ? 'Null' : formData.city,
      source: formData.source,
      other_source_description: formData.other_source_description,
      notification_consent: notification_consent,
      other_notification_consent_description:
        formData.other_notification_consent_description,
      current_status: 'Lead',
      assigned_counselor_id: 'Null',
      status_change_date: 'Null',
      registration_date: formData.registration_date,
      created_at: 'Null',
      updated_at: 'Null',
    },
  ];
  // Trả lại dữ liệu nhận được cho client
  return res.status(200).json({
    message: 'Đăng ký thành công',
    dataReceived: inputData,
  });
}

export async function SendEmailController(req: Request, res: Response) {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
  }

  try {
    await SendEmail(to, subject, text, html);
    return res.status(200).json({ message: 'Email đã được gửi' });
  } catch (error) {
    console.error('Error in SendEmailController:', error);
    return res.status(500).json({ error: 'Lỗi khi gửi email' });
  }
}

// Hàm lấy dữ liệu và format lại JSON
export async function GetCourseCategories() {
  const khoaHocs = await prisma.khoahoc.findMany({
    include: { khoahoc_lop: true },
  });

  const khoaHocsWithLops = await Promise.all(
    khoaHocs.map(async (khoaHoc) => {
      const courses = await Promise.all(
        khoaHoc.khoahoc_lop.map(async (course) => {
          const lops = await prisma.lop.findMany({
            where: { ID_KhoaHoc_Lop: course.ID },
          });

          return {
            id: course.ID,
            name: course.Name || '',
            class: lops.map((cls) => ({ name: cls.Name || '' })),
          };
        })
      );

      return {
        title: khoaHoc.Name || '',
        course: courses,
      };
    })
  );

  return khoaHocsWithLops;
}

// Controller trả dữ liệu JSON
export const DatauserController = async (req: Request, res: Response) => {
  try {
    const coursecategories = await GetCourseCategories();

    res.status(200).json(coursecategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

//API gửi trả API giới tính từ tên (tự xây dựng bẳng máy học)
export async function predictGender(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  try {
    const response = await axios.post('http://localhost:5000/predict', {
      name,
    });
    let gender = response.data.gender;
    const probability = response.data.confidence;

    if (gender === 'Nam' && probability > 70) {
      gender = 'Nam';
    } else if (gender == 'Nữ' && probability > 70) {
      gender = 'Nữ';
    } else {
      gender = 'Chưa rõ';
    }
    return res.json({ name, gender });
  } catch (error) {
    console.error('Error calling Python API:', error);
    return res.status(500).json({ error: 'Prediction failed' });
  }
}

export async function getMaxStudentId() {
  const result = await prisma.students.aggregate({
    _max: {
      id: true,
    },
  });

  return result._max.id;
}
