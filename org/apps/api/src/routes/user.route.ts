const router = require('express').Router();
import userController from '../controllers/user.controller';


export default  (app : any) => {
  app.use('/api/v1/users', router);

  router.get('/', userController.getAllUsers);
}
