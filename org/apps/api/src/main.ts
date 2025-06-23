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

// Import các middleware global của bạn (nếu có, ví dụ: AuthMiddleware nếu nó là global)
// import { MyGlobalMiddleware } from './middlewares/my-global.middleware';

const host = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

// Thay đổi lớn: Tạo ứng dụng Express trực tiếp với routing-controllers
const app: Express = createExpressServer({
  // Middleware
  middlewares: [
    express.json(), // Body parser
    express.urlencoded({ extended: true }), // URL-encoded body parser
    // Thêm log global ở đây để đảm bảo nó chạy trước mọi thứ
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.log(`GLOBAL_REQUEST_LOG: ${req.method} ${req.url}`); // LOG GLOBAL
      next();
    },
    // Nếu bạn có các middleware global khác không phải là routing-controllers (ví dụ: CORS), thêm vào đây
    // app.use(cors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true }));
    // Hoặc bạn có thể cấu hình CORS trong routing-controllers options
  ],
  cors: { // Cấu hình CORS trực tiếp trong routing-controllers
    origin: '*', // THAY THẾ BẰNG URL FRONTEND CỦA BẠN (ví dụ: 'http://localhost:4200')
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
    AuthController
  ],
  defaultErrorHandler: false
});

// Health check endpoint (nếu bạn muốn nó không nằm dưới /api, hãy đặt nó trước app.use('/api-docs'))
// Nếu bạn muốn nó nằm dưới /api, bạn có thể tạo một controller riêng.
// Để đơn giản, tôi sẽ giữ nó ở đây.
app.get('/health', async (req, res) => {
    const dbHealthy = await database.healthCheck();
    res.status(dbHealthy ? 200 : 503).json({
        status: dbHealthy ? 'healthy' : 'unhealthy',
        database: dbHealthy ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Swagger (đặt nó sau khi routing-controllers đã được khởi tạo)
// Lưu ý: nếu routePrefix là /api, thì swagger cũng nên được truy cập qua /api-docs hoặc bạn phải đặt nó trước routePrefix
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


app.listen(port, async () => {
    console.log(`🚀 Ready at http://${host}:${port}`);
    await database.connect(); // Đảm bảo database connect chỉ gọi một lần sau khi server đã lắng nghe
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