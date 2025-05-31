import jsend from '../jsend';
import {Request, Response} from "express";
import studentStatusHistoryService from "../services/student-status-history.service";

export  default {
  getAllStudentStatus : async (req: Request, res: Response) => {
    const page = req.query.page as string | number;
    const limit = req.query.limit as string | number;
    try{
      const student = await studentStatusHistoryService.getAllStudentStatus(page, limit);
      return res.json(jsend.success((student)));
    }catch (e : any) {
      return res.json(jsend.error(e));
    }
  }
}
