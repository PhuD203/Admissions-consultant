import {
  JsonController,
  Post,
  Get,
  Body,
  UseBefore,
} from 'routing-controllers';
import { DuplicateCheckMiddleware } from '../middlewares/duplicateChecker';
import jsend from '../jsend';
import { SendEmail } from '../services/Auto-send-email';

interface FormData {
  student_name: string;
  email: string;
  phone_number: string;
  zalo_phone?: string | null;
  link_facebook?: string | null;
  date_of_birth: string;
  gender?: string;
  current_education_level: string;
  other_education_level_description?: string | null;
  high_school_name?: string | null;
  city?: string | null;
  source?: string;
  other_source_description?: string | null;
  notification_consent?: string;
  other_notification_consent_description?: string | null;
  registration_date: string;
}

@JsonController('/uploadform')
export class UploadFormController {
  @Post('/submitform')
  @UseBefore(DuplicateCheckMiddleware)
  async submitForm(@Body() formData: FormData) {
    // Giả sử getMax lấy max id, tạm set = 1
    const getMax = 1;
    const countId = (getMax ?? 0) + 1;

    // Xử lý highschool
    let highschool = formData.high_school_name ?? '';
    if (
      formData.current_education_level.includes('Học sinh THPT') ||
      formData.current_education_level.includes('Sinh viên')
    ) {
      highschool = 'Đã tốt nghiệp';
    } else if (highschool.trim() === '') {
      highschool = 'Null';
    }

    // Xử lý notification_consent
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
          !formData.zalo_phone || formData.zalo_phone.trim() === ''
            ? formData.phone_number
            : formData.zalo_phone,
        link_facebook:
          !formData.link_facebook || formData.link_facebook.trim() === ''
            ? 'Null'
            : formData.link_facebook,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender ?? 'Null',
        current_education_level: formData.current_education_level,
        other_education_level_description:
          formData.other_education_level_description ?? 'Null',
        high_school_name: highschool,
        city:
          !formData.city || formData.city.trim() === ''
            ? 'Null'
            : formData.city,
        source: formData.source ?? 'Null',
        other_source_description: formData.other_source_description ?? 'Null',
        notification_consent: notification_consent,
        other_notification_consent_description:
          formData.other_notification_consent_description ?? 'Null',
        current_status: 'Lead',
        assigned_counselor_id: 'Null',
        status_change_date: 'Null',
        registration_date: formData.registration_date,
        created_at: 'Null',
        updated_at: 'Null',
      },
    ];

    return jsend.success({
      message: 'Đăng ký thành công',
      dataReceived: inputData,
    });
  }

  @Post('/sendemail')
  async sendEmail(
    @Body()
    body: {
      to?: string;
      subject?: string;
      text?: string;
      html?: string;
    }
  ) {
    const { to, subject, text, html } = body;
    if (!to || !subject || !text) {
      return jsend.error('Thiếu trường bắt buộc');
    }

    try {
      await SendEmail(to, subject, text, html);
      return jsend.success({ message: 'Email đã được gửi' });
    } catch (error) {
      console.error('Error in SendEmailController:', error);
      return jsend.error('Lỗi khi gửi email');
    }
  }

  @Get('/Datauser')
  async getDataUser() {
    const coursecategories = [
      {
        title: 'Khóa đào tạo dài hạn',
        course: [
          {
            id: 1,
            name: 'Ngành Lập trình viên Quốc tế - Aptech',
            class: [
              { name: 'Kỹ sư Kỹ thuật Phần mềm' },
              { name: 'Kỹ sư Công nghệ thông tin ' },
              { name: 'Kỹ sư Truyền thông đa phương tiện' },
              { name: 'Cử nhân Logistics và Quản lý chuỗi cung ứng' },
            ],
          },
          {
            id: 2,
            name: 'Ngành Mỹ thuật Đa phương tiện Quốc tế - Arena',
            class: [
              { name: 'Kỹ sư Truyền thông Đa phương tiện' },
              { name: 'Kỹ sư Công nghệ thông tin' },
              { name: 'Kỹ sư Kỹ thuật Phần mềm' },
              { name: 'Cử nhân Logistics và Quản lý chuỗi cung ứng' },
            ],
          },
        ],
      },
    ];

    return coursecategories;
  }
}
