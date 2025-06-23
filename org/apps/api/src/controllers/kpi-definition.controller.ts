import 'reflect-metadata';
import { Get, JsonController, QueryParam, Param, Res } from 'routing-controllers';
import { KPIStatisticsService } from '../services/kpi-definition.service';
import jsend from '../jsend'; 
import { Inject, Service } from 'typedi';

@Service()
@JsonController('/kpi-statistics')
export class KPIStatisticsController {
  constructor(@Inject('KPIStatisticsService') private kpiStatisticsService: KPIStatisticsService) {}

  /**
   * GET /api/kpi-statistics/overall
   * Get overall KPI statistics for all counselors.
   * Query parameters: startDate (optional, YYYY-MM-DD), endDate (optional, YYYY-MM-DD)
   */
  @Get('/overall')
  async getOverallKPIStatistics(
    @QueryParam('startDate') startDate: string | undefined,
    @QueryParam('endDate') endDate: string | undefined,
    @Res() res: any
  ) {
    try {
      // Convert string dates to Date objects for the service
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const statistics = await this.kpiStatisticsService.getOverallStatistics(start, end);

      if (statistics) {
        return res.json(jsend.success(statistics));
      } else {
        // Use jsend.fail for data not found, as per your example's pattern
        return res.status(404).json(jsend.fail('Overall KPI statistics not found or an error occurred.'));
      }
    } catch (e: any) {
      console.error('Error in KPIStatisticsController.getOverallKPIStatistics:', e);
      return res.status(500).json(jsend.error(e.message || 'Internal server error while fetching overall KPI statistics.'));
    }
  }

  /**
   * GET /api/kpi-statistics/counselor/:counselorId
   * Get KPI statistics for a specific counselor.
   * Path parameters: counselorId
   * Query parameters: startDate (optional, YYYY-MM-DD), endDate (optional, YYYY-MM-DD)
   */
  @Get('/counselor/:counselorId')
  async getCounselorKPIStatistics(
    @Param('counselorId') counselorId: string,
    @QueryParam('startDate') startDate: string | undefined,
    @QueryParam('endDate') endDate: string | undefined,
    @Res() res: any
  ) {
    try {
      const parsedCounselorId = parseInt(String(counselorId), 10);
      
      if (isNaN(parsedCounselorId)) {
        return res.status(400).json(jsend.fail('Invalid counselor ID provided.'));
      }

      
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const statistics = await this.kpiStatisticsService.getCounselorStatistics(parsedCounselorId, start, end);

      if (statistics) {
        return res.json(jsend.success(statistics));
      } else {
        return res.status(404).json(jsend.fail(`KPI statistics not found for counselor ID ${counselorId}.`));
      }
    } catch (e: any) {
      console.error('Error in KPIStatisticsController.getCounselorKPIStatistics:', e);
      return res.status(500).json(jsend.error(e.message || 'Internal server error while fetching counselor KPI statistics.'));
    }
  }

  /**
   * GET /api/kpi-statistics/warnings
   * Get KPI warnings for all counselors.
   * Query parameters: startDate (optional, YYYY-MM-DD), endDate (optional, YYYY-MM-DD)
   */
  @Get('/warnings')
  async getKPIWarnings(
    @QueryParam('startDate') startDate: string | undefined,
    @QueryParam('endDate') endDate: string | undefined,
    @Res() res: any
  ) {
    try {
      
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const warnings = await this.kpiStatisticsService.getKPIWarnings(start, end);

      if (warnings) {
        return res.json(jsend.success(warnings));
      } else {
        return res.status(200).json(jsend.success([], 'No KPI warnings found for the specified period.'));
      }
    } catch (e: any) {
      console.error('Error in KPIStatisticsController.getKPIWarnings:', e);
      return res.status(500).json(jsend.error(e.message || 'Internal server error while fetching KPI warnings.'));
    }
  }

  /**
   * GET /api/kpi-statistics/summary
   * Get a KPI summary for the dashboard.
   * Query parameters: counselorId (optional)
   */
  @Get('/summary')
  async getKPISummary(
    @QueryParam('counselorId') counselorId: number | undefined,
    @Res() res: any
  ) {
    try {
      const id = counselorId ? parseInt(counselorId as any, 10) : null; // Ensure conversion if it comes as string
      if (counselorId !== undefined && isNaN(id as number)) {
        return res.status(400).json(jsend.fail('Invalid counselor ID provided for summary.'));
      }

      const summary = await this.kpiStatisticsService.getKPISummary(id);

      if (summary) {
        return res.json(jsend.success(summary));
      } else {
        return res.status(404).json(jsend.fail('KPI summary not found or an error occurred.'));
      }
    } catch (e: any) {
      console.error('Error in KPIStatisticsController.getKPISummary:', e);
      return res.status(500).json(jsend.error(e.message || 'Internal server error while fetching KPI summary.'));
    }
  }
}