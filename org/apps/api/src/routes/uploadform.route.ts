const router = require('express').Router();

import {
  PostForm,
  SendEmailController,
  predictGender,
  DatauserController,
} from '../controllers/uploadfile.controller';
import { isDuplicate } from '../middleware/duplicateChecker';

// import studentController from '../controllers/student.controller';

export default (app: any) => {
  app.use('/api/uploadform', router);

  router.post('/submitform', isDuplicate, PostForm);
  // router.get('/', studentController.getAllStudent);

  router.post('/sendemail', SendEmailController);
  router.post('/predict-gender', predictGender);

  router.get('/Datauser', DatauserController);
};
