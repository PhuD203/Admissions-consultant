import jsend from '../jsend';
import userServices from '../services/user.service';
import {Request, Response} from "express";

export default {
  getAllUsers: async (req : Request, res : Response) => {
    const page = req.query.page as string | number;
    const limit = req.query.limit as string | number;
    try{
      const users = await userServices.getAllUsers(page , limit);
      return res.json(jsend.success((users)));
    }catch (e : any) {
      return res.json(jsend.error(e));
    }
  }
}
