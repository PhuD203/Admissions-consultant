import { Router } from 'express';
import {
  PostForm,
  SendEmailController,
  HelloWorldController,
} from '../controllers/itemcontrollers';

const router: Router = Router();

router.post('/submitform', PostForm);

router.post('/sendemail', SendEmailController);

router.get('/hello', HelloWorldController);

export default router;
