import { Request, Response } from 'express';
import { SendEmail } from '../email/emailsender';
import axios from 'axios';

export function PostForm(req: Request, res: Response) {
  const formData = req.body;

  const parts = formData.interested_courses_details.split('___');
  let highschool = formData.high_school_name;
  if (!formData.current_education_level.includes('Học sinh')) {
    highschool = 'Đã tốt nghiệp';
  } else if (highschool === '') {
    highschool = 'Null';
  }

  const inputData = [
    {
      student_name: formData.student_name,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
      email: formData.email,
      phone_number: formData.phone_number,
      zalo_phone:
        formData.zalo_phone === ''
          ? formData.phone_number
          : formData.zalo_phone,
      link_facebook:
        formData.link_facebook === '' ? 'Null' : formData.link_facebook,
      current_education_level: formData.current_education_level,
      other_education_level_description:
        formData.other_education_level_description === '',
      high_school_name: highschool,
      city: formData.city === '' ? 'Null' : formData.city,
      source: formData.source,
      current_status: 'No contact yet',
      registration_date: formData.registration_date,
      status_change_date: 'Null',
      student_created_at: 'Null',
      student_updated_at: 'Null',
      assigned_counselor_name: 'Null',
      assigned_counselor_email: 'Null',
      assigned_counselor_type: 'Null',
      interested_courses_details: [
        {
          course: parts[0],
          class: parts[1],
        },
      ],
      student_status_history: 'null',
      last_consultation_date: 'null',
      last_consultation_duration_minutes: 'null',
      last_consultation_notes: 'null',
      last_consultation_type: 'null',
      last_consultation_status: 'Contact',
      last_consultation_counselor_name: 'null',
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

export const HelloWorldController = (req: Request, res: Response) => {
  res.status(200).send('Hello World');
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
