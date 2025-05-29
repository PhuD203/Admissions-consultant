const router = require('express').Router();
import userController from '../controllers/user.controller';


export default  (app : any) => {
  app.use('/api', router);

  router.get('/users', userController.getAllUsers);
}
