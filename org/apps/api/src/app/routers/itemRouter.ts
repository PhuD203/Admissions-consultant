import { Router } from 'express';
import {
  PostForm,
  SendEmailController,
  HelloWorldController,
  predictGender,
} from '../controllers/itemcontrollers';

import { isDuplicate } from '../middleware/itemMiddleware';
const router: Router = Router();

router.post('/submitform', isDuplicate, PostForm);

router.post('/sendemail', SendEmailController);

router.get('/hello', HelloWorldController);

router.post('/predict-gender', predictGender);

export default router;
