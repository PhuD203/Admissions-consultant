import { JsonController, Post, Get, Body } from 'routing-controllers';
import jsend from '../jsend';
import { SendEmail } from '../services/Auto-send-email';
import {
  getAllStudentsOnly,
  getCountIdStudent,
} from '../services/data.service';

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
  interested_courses_details: string;
}

@JsonController('/uploadform')
export class UploadFormController {
  @Post('/submitform')
  async submitForm(@Body() formData: FormData) {
    if (!formData?.interested_courses_details || !formData?.registration_date) {
      return jsend.error('Thiếu thông tin bắt buộc');
    }

    const parts = formData.interested_courses_details.split('___');
    if (parts.length < 2) return jsend.error('Thiếu trường bắt buộc');

    const dateStr = formData.registration_date.split(' ')[1];
    if (!dateStr) return jsend.error('Thiếu trường bắt buộc');

    const [day2, month2, year2] = dateStr.split('/').map(Number);
    const currentDate = new Date(year2, month2 - 1, day2);

    const students = await getAllStudentsOnly();

    const exists = students.some((item) => {
      if (!item.registration_date) return false;

      const registrationDate = new Date(item.registration_date);
      registrationDate.setMonth(registrationDate.getMonth() + 3);

      const diffTime = registrationDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return (
        removeVietnameseTones(item.student_name) ===
          removeVietnameseTones(formData.student_name) &&
        item.email === formData.email &&
        item.interested_courses_details === parts[1] &&
        diffDays < 0
      );
    });

    if (exists) {
      return jsend.success({
        message: 'Email đã được gửi',
      });
    } else {
      // Giả sử getMax lấy max id, tạm set = 1
      const getMax = await getCountIdStudent();
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

      let fsource = formData.source;

      if (fsource === 'Khác') {
        fsource = 'Other';
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
          source: fsource ?? 'Null',
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
      {
        title: 'Khóa đào tạo ngắn hạn',
        course: [
          {
            id: 1,
            name: 'Khóa học trực tuyến',
            class: [
              {
                name: 'Xây dựng Ứng dụng Web với Node.js và Express.JS Framework',
              },
              { name: 'Kiểm thử phần mềm cơ bản, Module 1' },
              { name: 'Thiết kế Đồ Họa cho Quảng cáo' },
              { name: 'Quản trị và an ninh mạng' },
              { name: 'Kiểm thử phần mềm tự động, Module 2' },
              { name: 'Lập trình ứng dụng đa nền tảng với Flutter' },
              { name: 'Phát triển ứng dụng Web với LARAVEL và ANGULARJS' },
              { name: 'Thiết kế Web và lập trình Front-end' },
              { name: 'Lập trình Back-end với PHP và MySQL' },
              { name: 'Thiết kế giao diện UI/UX Website bằng Figma' },
              {
                name: 'Trí tuệ nhân tạo ứng dụng ghi thanh mang đối tượng có tên name',
              },
            ],
          },
          {
            id: 2,
            name: 'Khóa học trực tiếp',
            class: [
              { name: 'Trí tuệ nhân tạo cho nhân viên văn phòng' },
              { name: 'Thiết kế đồ họa cho quảng cáo' },
              { name: 'Phân tích dữ liệu thông minh với Power BI và GenAI' },
            ],
          },
        ],
      },
      {
        title: 'Khóa đào tạo STEAM',
        course: [
          {
            id: 1,
            name: 'Khóa đào tạo STEAM',
            class: [
              { name: 'Phát triển tư duy với Python' },
              { name: 'Phát triển tư duy với lập trình Arduino' },
              { name: 'Thiết kế web sáng tạo' },
            ],
          },
        ],
      },
    ];

    return coursecategories;
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
