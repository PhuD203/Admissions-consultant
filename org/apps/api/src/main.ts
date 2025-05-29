// import express from 'express';
// import router from './app/routers/itemRouter';
// import cors from 'cors';
// import swaggerUi from 'swagger-ui-express';
// import YAML from 'yamljs';
// import path from 'path';
// // @ts-ignore
// import { PrismaClient } from '@prisma/client';

// import userRouter from './routes/user.route';

// const prisma = new PrismaClient();

// const host = process.env.HOST ?? 'localhost';
// const port = Number(process.env.PORT ?? 3000);

// const app = express();

// app.use(
//   cors({
//     origin: 'http://localhost:4200',
//   })
// );
// app.use('/', router); // dùng router cho đường dẫn gốc '/'
// app.use(express.json());

// const swaggerDocument = YAML.load(
//   path.resolve(process.cwd(), 'apps/api/src/openapi.yaml')
// );

// app.use(
//   cors({
//     origin: 'http://localhost:4200', // hoặc '*', hoặc danh sách domain
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   })
// );
// // Route để xem tài liệu Swagger UI
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.get('/', (req, res) => {
//   res.send({ message: 'Hello API!' });
// });

// <<<<<<< HEAD
// app.use('/api', router);

// app.listen(port, host, () => {
//   console.log(`[ ready ] http://${host}:${port}`);
// =======

// userRouter(app);

// app.listen(port, async () => {
//   console.log(`🚀 Ready at http://${host}:${port}`);

//   try {
//     await prisma.$connect();
//     console.log('📦 Connected to Prisma database successfully!');
//   } catch (e) {
//     console.error('❌ Could not connect to Prisma database:', e);
//   }
// });

// process.on('beforeExit', async () => {
//   await prisma.$disconnect();
//   console.log('🔌 Disconnected from Prisma database.');
// >>>>>>> da981f3ebe3d27a83ab1766e06394cd2fad31b51
// });

import express from 'express';
import router from './app/routers/itemRouter';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

import userRouter from './routes/user.route';

const prisma = new PrismaClient();

const host = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

const app = express();

// Cấu hình CORS
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Xử lý JSON body
app.use(express.json());

// Dùng router cho đường dẫn gốc '/'
app.use('/', router);

// Dùng userRouter, truyền đối tượng app để đăng ký route
userRouter(app);

// Swagger UI để xem tài liệu API
const swaggerDocument = YAML.load(
  path.resolve(process.cwd(), 'apps/api/src/openapi.yaml')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route mặc định
app.get('/', (req, res) => {
  res.send({ message: 'Hello API!' });
});

// Start server, kết nối Prisma database
app.listen(port, host, async () => {
  console.log(`🚀 Ready at http://${host}:${port}`);

  try {
    await prisma.$connect();
    console.log('📦 Connected to Prisma database successfully!');
  } catch (e) {
    console.error('❌ Could not connect to Prisma database:', e);
  }
});

// Ngắt kết nối Prisma khi ứng dụng tắt
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Disconnected from Prisma database.');
});
