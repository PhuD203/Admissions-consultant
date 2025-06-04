const router = require('express').Router();
import studentController from '../controllers/student.controller';


export default  (app : any) => {
  app.use('/api/v1/students', router);

  router.get('/', studentController.getAllStudent);
  router.get('/:id', studentController.getStudentById);
  router.patch('/:id', studentController.updateStudent);
  router.delete('/:id', studentController.deleteStudent);
  router.post('/', studentController.createStudent);
}
