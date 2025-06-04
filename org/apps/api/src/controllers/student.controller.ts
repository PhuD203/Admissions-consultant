import jsend from '../jsend';
import studentServices from '../services/student.service';
import {Request, Response} from "express";


export default {
  getAllStudent: async (req : Request, res : Response) => {
    const page = req.query.page as string | number;
    const limit = req.query.limit as string | number;
    try{
      const student = await studentServices.getAllStudents(page, limit);
      return res.json(jsend.success((student)));
    }catch (e : any) {
      return res.json(jsend.error(e));
    }
  },

  getStudentById: async (req : Request, res : Response) => {
    const {id} = req.params;
    const studentId = parseInt(id, 10);
    try {
      const student = await studentServices.getStudentById(studentId);
      return res.json(jsend.success((student)));
    }catch (e : any) {
      return res.json(jsend.error(e));
    }
  },

  deleteStudent: async (req : Request, res : Response) => {
    const {id} = req.params;
    const studentId = parseInt(id, 10);
    try{
      await studentServices.deleteStudent(studentId);
      return res.json(jsend.success({message: "Delete student by id: " + studentId + " successfully."}));
    }catch (e : any) {
      return res.json(jsend.error(e));
    }
  },

  createStudent : async (req : Request, res : Response) => {
    if(!req.body){
      return res.status(400).json(jsend.error("No data provided"));
    }

    try {
      const student = await studentServices.createStudent({...req.body});
      return res.json(jsend.success(student));
    }catch (e : any) {
      return res.json(jsend.error(e));
    }
  },

  updateStudent : async (req : Request, res : Response) => {
    const {id} = req.params;
    const studentId = parseInt(id, 10);

    try{
      const student = await studentServices.updateStudent(studentId,{...req.body});
      return res.json(jsend.success(student));
    }catch (e : any) {
      return res.json(jsend.error(e));
    }

  }
}
