import { PrismaClient, users_program_type } from '@prisma/client';

const prisma = new PrismaClient();

interface KPIStatistics {
  period: {
    startDate: string;
    endDate: string;
  };
  counselor: {
    id: number | null;
    programType: users_program_type | null;
  };
  kpi: {
    monthlyTarget: number;
    annualTarget: number;
    currentEnrollments: number;
    performanceRate: number;
    isWarning: boolean;
    warningMessage: string | null;
  };
  statistics: {
    consulting: StatisticItem;
    registration: StatisticItem;
    potential: StatisticItem;
    enrollments: EnrollmentStatistic;
  };
  details: {
    enrollmentsByProgram: Record<string, number>;
    totalRevenue: number;
  };
}

interface StatisticItem {
  title: string;
  percentage: number;
  count: number;
  total: number;
  trend: number;
  description: string;
}

interface EnrollmentStatistic {
  title: string;
  count: number;
  trend: number;
  description: string;
}

interface KPIWarning {
  counselorId: number;
  counselorName: string;
  programType: users_program_type | null;
  currentEnrollments: number;
  monthlyTarget: number;
  performanceRate: number;
  warningMessage: string;
}

class KPIStatisticsService {

  async calculateKPIStatistics(
    counselorId: number | null = null,
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<KPIStatistics | null> {
    try {

      let actualCounselorId: number | null = null;
      if (counselorId !== null) {
          actualCounselorId = typeof counselorId === 'string' ? parseInt(counselorId, 10) : counselorId;
          if (isNaN(actualCounselorId)) {
              actualCounselorId = null; 
          }
      }
      
      if (!startDate || !endDate) {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      
      const counselorFilter = counselorId ? { assigned_counselor_id: counselorId } : {};
      const enrollmentCounselorFilter = counselorId ? { counselor_id: counselorId } : {};

      
      const [totalStudents, consultingStudents] = await Promise.all([
        prisma.students.count({
          where: {
            ...counselorFilter,
            created_at: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.students.count({
          where: {
            ...counselorFilter,
            current_status: 'Engaging',
            status_change_date: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ]);

      const registeredStudents = await prisma.students.count({
        where: {
          ...counselorFilter,
          current_status: 'Registered',
          status_change_date: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const potentialStudents = await prisma.students.count({
        where: {
          ...counselorFilter,
          current_status: {
            in: ['Lead', 'Engaging']
          },
          created_at: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const [totalEnrollments, enrollmentsWithDetails] = await Promise.all([
        prisma.studentenrollments.count({
          where: {
            ...enrollmentCounselorFilter,
            enrollment_date: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.studentenrollments.findMany({
          where: {
            ...enrollmentCounselorFilter,
            enrollment_date: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            students: true,
            courses: true,
            users: true
          }
        })
      ]);

      let counselorProgramType: users_program_type | null = null;
      let monthlyKPITarget = 0;
      let annualKPITarget = 0;

      if (counselorId) {
        const counselor = await prisma.users.findUnique({
          where: { id: counselorId },
          select: { program_type: true }
        });
        
        if (counselor) {
          counselorProgramType = counselor.program_type;
          
          switch (counselorProgramType) {
            case 'Aptech':
            case 'Arena':
              annualKPITarget = 300;
              monthlyKPITarget = Math.round(300 / 12);
              break;
            case 'Short_term___Steam':
              annualKPITarget = 1000;
              monthlyKPITarget = Math.round(1000 / 12);
              break;
            default:
              annualKPITarget = 300; // Default
              monthlyKPITarget = Math.round(300 / 12);
          }
        }
      }

      const consultingRate = totalStudents > 0 ? (consultingStudents / totalStudents) * 100 : 0;
      const registrationRate = totalStudents > 0 ? (registeredStudents / totalStudents) * 100 : 0;
      const potentialRate = totalStudents > 0 ? (potentialStudents / totalStudents) * 100 : 0;

      const currentMonthEnrollments = totalEnrollments;
      const kpiPerformanceRate = monthlyKPITarget > 0 ? (currentMonthEnrollments / monthlyKPITarget) * 100 : 0;
      const isKPIWarning = kpiPerformanceRate < 80; 

      const previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);
      const previousEndDate = new Date(endDate);
      previousEndDate.setMonth(previousEndDate.getMonth() - 1);

      const [prevConsulting, prevRegistered, prevPotential, prevEnrollments] = await Promise.all([
        prisma.students.count({
          where: {
            ...counselorFilter,
            current_status: 'Engaging',
            status_change_date: {
              gte: previousStartDate,
              lte: previousEndDate
            }
          }
        }),
        prisma.students.count({
          where: {
            ...counselorFilter,
            current_status: 'Registered',
            status_change_date: {
              gte: previousStartDate,
              lte: previousEndDate
            }
          }
        }),
        prisma.students.count({
          where: {
            ...counselorFilter,
            current_status: {
              in: ['Lead', 'Engaging']
            },
            created_at: {
              gte: previousStartDate,
              lte: previousEndDate
            }
          }
        }),
        prisma.studentenrollments.count({
          where: {
            ...enrollmentCounselorFilter,
            enrollment_date: {
              gte: previousStartDate,
              lte: previousEndDate
            }
          }
        })
      ]);


      const consultingTrend = prevConsulting > 0 ? ((consultingStudents - prevConsulting) / prevConsulting) * 100 : 0;
      const registrationTrend = prevRegistered > 0 ? ((registeredStudents - prevRegistered) / prevRegistered) * 100 : 0;
      const potentialTrend = prevPotential > 0 ? ((potentialStudents - prevPotential) / prevPotential) * 100 : 0;
      const enrollmentTrend = prevEnrollments > 0 ? ((totalEnrollments - prevEnrollments) / prevEnrollments) * 100 : 0;

      return {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        },
        counselor: {
          id: counselorId,
          programType: counselorProgramType
        },
        kpi: {
          monthlyTarget: monthlyKPITarget,
          annualTarget: annualKPITarget,
          currentEnrollments: currentMonthEnrollments,
          performanceRate: Math.round(kpiPerformanceRate * 100) / 100,
          isWarning: isKPIWarning,
          warningMessage: isKPIWarning ? 
            `Cảnh báo: KPI hiện tại (${currentMonthEnrollments}) thấp hơn mục tiêu tháng (${monthlyKPITarget})` : 
            null
        },
        statistics: {
          consulting: {
            title: "Tỷ lệ Đang tư vấn",
            percentage: Math.round(consultingRate * 100) / 100,
            count: consultingStudents,
            total: totalStudents,
            trend: Math.round(consultingTrend * 100) / 100,
            description: "Cần theo dõi và chuyển đổi"
          },
          registration: {
            title: "Tỷ lệ Đã đăng ký",
            percentage: Math.round(registrationRate * 100) / 100,
            count: registeredStudents,
            total: totalStudents,
            trend: Math.round(registrationTrend * 100) / 100,
            description: "Số lượng đăng ký ổn định"
          },
          potential: {
            title: "Tỷ lệ Tiềm năng",
            percentage: Math.round(potentialRate * 100) / 100,
            count: potentialStudents,
            total: totalStudents,
            trend: Math.round(potentialTrend * 100) / 100,
            description: "Khả năng chuyển đổi cao"
          },
          enrollments: {
            title: "Tổng số mục",
            count: totalEnrollments,
            trend: Math.round(enrollmentTrend * 100) / 100,
            description: "Đánh giá hiệu suất tổng thể"
          }
        },
        details: {
          enrollmentsByProgram: enrollmentsWithDetails.reduce((acc, enrollment) => {
            const programType = enrollment.users?.program_type || 'Unknown';
            acc[programType] = (acc[programType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          totalRevenue: enrollmentsWithDetails.reduce((sum, enrollment) => {
            return sum + parseFloat(enrollment.fee_paid.toString() || '0');
          }, 0)
        }
      };

    } catch (e) {
      console.error("Error in KPIStatisticsService.calculateKPIStatistics:", e);
      return null;
    }
  }

  /**
   * Get KPI warnings for all counselors
   */
  async getKPIWarnings(
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<KPIWarning[] | null> {
    try {
      // Get all active counselors
      const counselors = await prisma.users.findMany({
        where: {
          user_type: 'counselor',
          status: 'active'
        },
        select: {
          id: true,
          full_name: true,
          program_type: true
        }
      });

      const warnings: KPIWarning[] = [];

      for (const counselor of counselors) {
        const stats = await this.calculateKPIStatistics(counselor.id, startDate, endDate);
        
        if (stats && stats.kpi.isWarning) {
          warnings.push({
            counselorId: counselor.id,
            counselorName: counselor.full_name,
            programType: counselor.program_type,
            currentEnrollments: stats.kpi.currentEnrollments,
            monthlyTarget: stats.kpi.monthlyTarget,
            performanceRate: stats.kpi.performanceRate,
            warningMessage: stats.kpi.warningMessage || ''
          });
        }
      }

      return warnings;
    } catch (e) {
      console.error("Error in KPIStatisticsService.getKPIWarnings:", e);
      return null;
    }
  }

  /**
   * Get overall statistics for all counselors
   */
  async getOverallStatistics(
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<KPIStatistics | null> {
    try {
      return await this.calculateKPIStatistics(null, startDate, endDate);
    } catch (e) {
      console.error("Error in KPIStatisticsService.getOverallStatistics:", e);
      return null;
    }
  }

  /**
   * Get statistics for a specific counselor
   */
  async getCounselorStatistics(
    counselorId: number,
    startDate: Date | null = null,
    endDate: Date | null = null
  ): Promise<KPIStatistics | null> {
    try {
      return await this.calculateKPIStatistics(counselorId, startDate, endDate);
    } catch (e) {
      console.error("Error in KPIStatisticsService.getCounselorStatistics:", e);
      return null;
    }
  }

  /**
   * Get KPI summary for dashboard
   */
  async getKPISummary(counselorId: number | null = null): Promise<{
    consulting: { percentage: number; trend: number; count: number };
    registration: { percentage: number; trend: number; count: number };
    potential: { percentage: number; trend: number; count: number };
    enrollments: { count: number; trend: number };
    kpiWarning?: string;
  } | null> {
    try {
      const stats = await this.calculateKPIStatistics(counselorId);
      
      if (!stats) return null;

      return {
        consulting: {
          percentage: stats.statistics.consulting.percentage,
          trend: stats.statistics.consulting.trend,
          count: stats.statistics.consulting.count
        },
        registration: {
          percentage: stats.statistics.registration.percentage,
          trend: stats.statistics.registration.trend,
          count: stats.statistics.registration.count
        },
        potential: {
          percentage: stats.statistics.potential.percentage,
          trend: stats.statistics.potential.trend,
          count: stats.statistics.potential.count
        },
        enrollments: {
          count: stats.statistics.enrollments.count,
          trend: stats.statistics.enrollments.trend
        },
        kpiWarning: stats.kpi.warningMessage || undefined
      };
    } catch (e) {
      console.error("Error in KPIStatisticsService.getKPISummary:", e);
      return null;
    }
  }
}
export default new KPIStatisticsService();