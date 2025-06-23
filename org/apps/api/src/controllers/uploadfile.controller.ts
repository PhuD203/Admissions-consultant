import jsend from '../jsend';
import { Request, Response } from 'express';
import axios from 'axios';
import studentServices from '../services/student.service';
import { getCourseCategories } from '../services/cource.service';

import { SendEmail } from '../services/Auto-send-email';

export async function PostForm(req: Request, res: Response) {
  const formData = req.body;
  // const parts = formData.interested_courses_details.split('___');
  const getMax = await studentServices.getMaxStudentId();
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
  return res.json(
    jsend.success({
      message: 'Đăng ký thành công',
      dataReceived: inputData,
    })
  );
}

export async function SendEmailController(req: Request, res: Response) {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json(jsend.error('Thiếu trường bắt buộc'));
  }
  try {
    await SendEmail(to, subject, text, html);
    return res.json(
      jsend.success({
        message: 'Email đã được gửi',
      })
    );
  } catch (error) {
    console.error('Error in SendEmailController:', error);
    return res.status(500).json(jsend.error('Lỗi khi gửi email'));
  }
}

//API gửi trả API giới tính từ tên (tự xây dựng bẳng máy học)
export async function predictGender(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json(jsend.error('Missing name'));
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
    return res.json(
      jsend.success({
        name: name,
        gender: gender,
      })
    );
  } catch (error) {
    return res.status(500).json(jsend.error('Prediction failed'));
  }
}

// Controller trả dữ liệu JSON
export const DatauserController = async (req: Request, res: Response) => {
  try {
    const coursecategories = await getCourseCategories();
    res.status(200).json(coursecategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
