// src/main.ts
import 'reflect-metadata'; // <-- Vẫn phải ở dòng đầu tiên

import express, { Express } from 'express'; // Bỏ Express, chúng ta không cần tạo 2 app instance
import { database } from './config/db.config';
import { specs, swaggerUi } from './docs/swagger';
import { createExpressServer } from 'routing-controllers';

// Import tất cả các controllers của bạn
import { UserController } from './controllers/user.controller';
import { StudentController } from './controllers/student.controller';
import { CourseController } from './controllers/course.controller';
import { KPIStatisticsController } from './controllers/kpi-definition.controller';
import { ConsultingInformationManagementController } from './controllers/consulting-information-management.controller';
import { AuthController } from './controllers/auth.controller';
import { DashboardAnalyticsController } from './controllers/consultation-session.controller';



const host = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);


const app: Express = createExpressServer({
  middlewares: [
    express.json(), 
    express.urlencoded({ extended: true }), 
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.log(`GLOBAL_REQUEST_LOG: ${req.method} ${req.url}`); // LOG GLOBAL
      next();
    },
  ],
  cors: { 
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  },

  routePrefix: '/api',
  controllers: [
    UserController,
    StudentController,
    CourseController,
    KPIStatisticsController,
    ConsultingInformationManagementController,
    AuthController,
    DashboardAnalyticsController
  ],
  defaultErrorHandler: false
});


app.get('/health', async (req, res) => {
    const dbHealthy = await database.healthCheck();
    res.status(dbHealthy ? 200 : 503).json({
        status: dbHealthy ? 'healthy' : 'unhealthy',
        database: dbHealthy ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.listen(port, async () => {
    console.log(`🚀 Ready at http://${host}:${port}`);
    await database.connect(); 
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, starting graceful shutdown...');
    await database.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, starting graceful shutdown...');
    await database.disconnect();
    process.exit(0);
});

process.on('beforeExit', async () => {
    await database.disconnect();
});

export { app };
export default app;