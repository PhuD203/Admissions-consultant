import { Get, Post, Put, Delete, JsonController, QueryParam, Param, Body, Res } from 'routing-controllers';
import jsend from '../jsend';
import consultationSessionService from '../services/consultation-session.service';
import 'reflect-metadata';

@JsonController('/consultation-sessions')
export class ConsultationSessionController {
  @Get('')
  async getAllConsultationSessions(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const result = await consultationSessionService.getAllConsultationSessions(page, limit);
      if (!result) {
        return res.status(500).json(jsend.error('Failed to fetch consultation sessions'));
      }
      return res.json(jsend.success(result));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Get('/:id')
  async getConsultationSessionById(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      const consultationSession = await consultationSessionService.getConsultationSessionById(id);
      if (!consultationSession) {
        return res.status(404).json(jsend.fail('Consultation session not found'));
      }
      return res.json(jsend.success(consultationSession));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Post('')
  async createConsultationSession(
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const consultationSession = await consultationSessionService.createConsultationSession(data);
      if (!consultationSession) {
        return res.status(400).json(jsend.fail('Failed to create consultation session'));
      }
      return res.status(201).json(jsend.success(consultationSession));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Put('/:id')
  async updateConsultationSession(
    @Param('id') id: number,
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const consultationSession = await consultationSessionService.updateConsultationSession(id, data);
      if (!consultationSession) {
        return res.status(404).json(jsend.fail('Consultation session not found or update failed'));
      }
      return res.json(jsend.success(consultationSession));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Delete('/:id')
  async deleteConsultationSession(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      await consultationSessionService.deleteConsultationSession(id);
      return res.json(jsend.success(null, 'Consultation session deleted successfully'));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }
}