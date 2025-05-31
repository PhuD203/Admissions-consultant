import studentStatusHistoryController from "../controllers/student-status-history.controller";

const router = require('express').Router();



export default  (app : any) => {
  app.use('/api/v1/student_status', router);

  router.get('/', studentStatusHistoryController.getAllStudentStatus);
  // router.get('/:id', studentController.getStudentById);
  // router.patch('/:id', studentController.updateStudent);
  // router.delete('/:id', studentController.deleteStudent);
  // router.post('/', studentController.createStudent);
}
