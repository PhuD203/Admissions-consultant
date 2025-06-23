// @ts-ignore
import {
  PrismaClient,
  students,
  students_current_status,
  // courses,
} from '@prisma/client';
import Paginator from './paginator';
import { StudentCreateDTO } from '../dtos/student/student-create.dto';
import { StudentDetailResponse } from '../dtos/student/student-detail.dto';


const prisma = new PrismaClient();


class StudentService {

  async getAllStudents(
    page: number | string = 1,
    limit: number | string = 10
  ): Promise<{ students: students[]; metadata: any } | null> {
    try {
      const paginator = new Paginator(page, limit);

      const [totalStudentsCount, students] = await Promise.all([
        prisma.students.count(),
        prisma.students.findMany({
          skip: paginator.offset,
          take: paginator.limit,
        }),
      ]);

      const metadata = paginator.getMetadata(totalStudentsCount);
      return {
        students,
        metadata,
      };
    } catch (e) {
      console.error('Error in StudentService.getAllStudents:', e);
      return null;
    }
  }

  async getStudentById(studentId: number): Promise<students | null> {
    try {
      return await prisma.students.findUnique({
        where: {
          id: studentId,
        },
      });
    } catch (e) {
      console.error('Error in StudentService.getStudentById:', e);
      return null;
    }
  }

  async deleteStudent(studentId: number): Promise<void> {
    try {
      await prisma.students.delete({
        where: {
          id: studentId,
        },
      });
    } catch (e) {
      // Tùy chọn: kiểm tra lỗi nếu sinh viên không tồn tại để trả về thông báo cụ thể hơn
      console.error('Error in StudentService.deleteStudent:', e);
      throw e; // Ném lỗi để controller có thể xử lý
    }
  }


  async createStudent(
    studentDTO: StudentCreateDTO
  ): Promise<StudentDetailResponse | null> {

    try {
      const studentData: any = {
        student_name: studentDTO.student_name,
        phone_number: studentDTO.phone_number,
        gender: studentDTO.gender,
        current_education_level: studentDTO.current_education_level,
        source: studentDTO.source,
        notification_consent: studentDTO.notification_consent,
        current_status: students_current_status.Lead,
      };

      if (studentDTO.email !== undefined && studentDTO.email !== '') {
        studentData.email = studentDTO.email;
      } else {
        studentData.email = null;
      }

      if (studentDTO.zalo_phone !== undefined && studentDTO.zalo_phone !== '') {
        studentData.zalo_phone = studentDTO.zalo_phone;
      } else {
        studentData.zalo_phone = null;
      }

      if (
        studentDTO.link_facebook !== undefined &&
        studentDTO.link_facebook !== ''
      ) {
        studentData.link_facebook = studentDTO.link_facebook;
      } else {
        studentData.link_facebook = null;
      }

      if (
        studentDTO.other_education_level_description !== undefined &&
        studentDTO.other_education_level_description !== ''
      ) {
        studentData.other_education_level_description =
          studentDTO.other_education_level_description;
      } else {
        studentData.other_education_level_description = null;
      }

      if (
        studentDTO.high_school_name !== undefined &&
        studentDTO.high_school_name !== ''
      ) {
        studentData.high_school_name = studentDTO.high_school_name;
      } else {
        studentData.high_school_name = null;
      }

      if (studentDTO.city !== undefined && studentDTO.city !== '') {
        studentData.city = studentDTO.city;
      } else {
        studentData.city = null;
      }

      if (
        studentDTO.other_source_description !== undefined &&
        studentDTO.other_source_description !== ''
      ) {
        studentData.other_source_description =
          studentDTO.other_source_description;
      } else {
        studentData.other_source_description = null;
      }

      if (
        studentDTO.other_notification_consent_description !== undefined &&
        studentDTO.other_notification_consent_description !== ''
      ) {
        studentData.other_notification_consent_description =
          studentDTO.other_notification_consent_description;
      } else {
        studentData.other_notification_consent_description = null;
      }

      if (studentDTO.date_of_birth) {
        studentData.date_of_birth = new Date(studentDTO.date_of_birth);
      } else {
        studentData.date_of_birth = null;
      }

      if (studentDTO.registration_date) {
        studentData.registration_date = this.parseRegistrationDate(
          studentDTO.registration_date
        );
      } else {
        studentData.registration_date = null;
      }

      const newStudent = await prisma.students.create({
        data: studentData,
      });

      console.log('Student created successfully:', newStudent);
      let conselor_name: string | null = null;
      let assigned_counselor_type: string | null = null;
      let interested_courses_details: string | null = null;
      let varStudentstatushistory: any;
      let varConsultationsessions: any;
      if (studentDTO.interested_courses_details) {
        const courseNames = studentDTO.interested_courses_details
          .split('___')
          .map((name) => name.trim())
          .filter((name) => name.length > 0);

        if (courseNames.length > 0) {
          // Tìm ID và program_type của các khóa học dựa trên tên
          const courses = await prisma.courses.findMany({
            where: {
              name: {
                in: courseNames,
              },
            },
            select: {
              id: true,
              program_type: true,
            },
          });

          console.log('Courses found in DB:', courses);

          // Thu thập các loại chương trình duy nhất
          const interestedProgramTypes = new Set(
            courses.map((c) => c.program_type)
          );

          // Chèn vào bảng `student_interested_courses`
          if (courses.length > 0) {
            await prisma.$transaction(
              courses.map((course) =>
                prisma.student_interested_courses.create({
                  data: {
                    student_id: newStudent.id,
                    course_id: course.id,
                  },
                })
              )
            );
          }

          if (interestedProgramTypes.size > 0) {
            const specialtyNames = Array.from(interestedProgramTypes).map(
              (type) => {
                switch (type) {
                  case 'Aptech':
                    return 'Aptech Program';
                  case 'Arena':
                    return 'Arena Program';
                  case 'Short_term___Steam':
                    return 'Short-term + Steam Program';
                  default:
                    return 'General Consulting';
                }
              }
            );

            const availableCounselor = await prisma.users.findFirst({
              where: {
                user_type: 'counselor',
                status: 'active',
                userspecializations: {
                  some: {
                    counselorspecializations: {
                      name: {
                        in: specialtyNames,
                      },
                    },
                  },
                },
              },

              orderBy: {
                id: 'desc',
              },
            });

            conselor_name = availableCounselor
              ? availableCounselor.full_name
              : 'Chưa có tư vấn viên';
            assigned_counselor_type = availableCounselor
              ? availableCounselor.user_type
              : null;
            interested_courses_details = courses
              .map(
                (c) => `${courseNames} (ID: ${c.id}, Loại: ${c.program_type})`
              )
              .join(', ');
            if (availableCounselor) {
              await prisma.students.update({
                where: { id: newStudent.id },
                data: {
                  assigned_counselor_id: availableCounselor.id,
                  status_change_date: new Date(),
                },
              });

              varStudentstatushistory =
                await prisma.studentstatushistory.create({
                  data: {
                    student_id: newStudent.id,
                    old_status: students_current_status.Lead,
                    new_status: students_current_status.Lead,
                    changed_by_user_id: availableCounselor.id,
                    notes: `Gán tư vấn viên ${
                      availableCounselor.full_name
                    } cho sinh viên ${
                      newStudent.student_name
                    } với các khóa học: ${Array.from(
                      interestedProgramTypes
                    ).join(', ')}`,
                  },
                });

              varConsultationsessions =
                await prisma.consultationsessions.create({
                  data: {
                    counselor_id: availableCounselor.id,
                    student_id: newStudent.id,
                    session_date: new Date(),
                    session_type: 'Phone_Call',
                    session_status: 'Scheduled',
                  },
                });

              console.log(
                `Student ${newStudent.id} assigned to counselor ${availableCounselor.id}`
              );
            } else {
              console.warn(
                `Không tìm thấy tư vấn viên phù hợp cho sinh viên ${
                  newStudent.id
                } với các khóa học: ${Array.from(interestedProgramTypes).join(
                  ', '
                )}`
              );
            }
          }
        }
      }

      const mappedResponse: StudentDetailResponse = {
        student_id: newStudent.id,
        student_name: newStudent.student_name,
        email: newStudent.email || null,
        phone_number: newStudent.phone_number,
        zalo_phone: newStudent.zalo_phone || null,
        link_facebook: newStudent.link_facebook || null,
        date_of_birth: newStudent.date_of_birth
          ? newStudent.date_of_birth.toISOString().split('T')[0]
          : null, // Định dạng "YYYY-MM-DD"
        current_education_level: newStudent.current_education_level,
        other_education_level_description:
          newStudent.other_education_level_description || 'Không có',
        high_school_name: newStudent.high_school_name || null,
        city: newStudent.city || null,
        source: newStudent.source,
        notification_consent: newStudent.notification_consent,
        current_status: newStudent.current_status,
        status_change_date: newStudent.status_change_date
          ? this.formatDateTime(newStudent.status_change_date)
          : null,
        registration_date: newStudent.registration_date
          ? this.formatDateTime(newStudent.registration_date)
          : null,
        student_created_at: this.formatDateTime(newStudent.created_at),
        student_updated_at: this.formatDateTime(newStudent.updated_at),
        assigned_counselor_name: conselor_name || null,
        assigned_counselor_type: assigned_counselor_type || null,
        interested_courses_details: interested_courses_details || null,
        enrolled_courses_details: null, // Cần thêm logic nếu bạn có bảng `studentenrollments` và muốn đưa vào
        student_status_history: varStudentstatushistory
          ? `Từ: ${varStudentstatushistory.old_status || 'null'} Đến: ${
              varStudentstatushistory.new_status
            } (Ngày: ${this.formatDateTime(
              varStudentstatushistory.change_date
            )}, Bởi: ${conselor_name || 'N/A'}, Ghi chú: ${
              varStudentstatushistory.notes || 'N/A'
            })`
          : null,
        last_consultation_date: varConsultationsessions?.session_date
          ? this.formatDateTime(varConsultationsessions.session_date)
          : null,
        last_consultation_duration_minutes:
          varConsultationsessions?.duration_minutes ?? 'Chưa có cuộc gọi hoặc phương thức khác',
        last_consultation_notes: varConsultationsessions?.notes || 'Chưa tư vấn',
        last_consultation_type: varConsultationsessions?.session_type || null,
        last_consultation_status:
          varConsultationsessions?.session_status || null,
        last_consultation_counselor_name: conselor_name || null,
      };

      return mappedResponse;
    } catch (e) {
      console.error('Error in StudentService.createStudent:', e);
      throw e;
    }
  }

  private parseRegistrationDate(dateString: string): Date | null {
    const parts = dateString.split(' ');
    if (parts.length < 2) return null;

    const timePart = parts[0];
    const datePart = parts[1];

    const [day, month, year] = datePart.split('/').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  private formatDateTime(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString();
  }
}

export default new StudentService();

