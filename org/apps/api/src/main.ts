import express, { Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { database } from './config/db.config';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

import { specs } from './docs/swagger';

import userRouter from './routes/user.route';
import studentRouter from './routes/student.route';
import studentStatusHistoryRoute from './routes/student-status-history.route';
import itemRouter from './app/routers/itemRouter';

const prisma = new PrismaClient();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Swagger JSON documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.get('/health', async (req, res) => {
  const dbHealthy = await database.healthCheck();
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Routes
userRouter(app);
studentRouter(app);
studentStatusHistoryRoute(app);
app.use('/api', itemRouter);

// Server start
app.listen(port, async () => {
  console.log(`🚀 Ready at http://${host}:${port}`);
  await database.connect();
  try {
    await prisma.$connect();
    console.log('📦 Connected to Prisma database successfully!');
  } catch (e) {
    console.error('❌ Could not connect to Prisma database:', e);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, starting graceful shutdown...');
  await database.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, starting graceful shutdown...');
  await database.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('beforeExit', async () => {
  await database.disconnect();
  await prisma.$disconnect();
});

export { app };
export default app;

// import express, { Express } from 'express';
// import cors from 'cors';
// import swaggerUi from 'swagger-ui-express';
// import YAML from 'yamljs';
// import path from 'path';
// import { database } from './config/db.config';
// import { specs } from './docs/swagger';
// // @ts-ignore
// import { PrismaClient } from '@prisma/client';

// import userRouter from './routes/user.route';
// import studentRouter from './routes/student.route';
// import studentStatusHistoryRoute from './routes/student-status-history.route';
// import itemRouter from './app/routers/itemRouter';

// const prisma = new PrismaClient();

// const host = process.env.HOST ?? 'localhost';
// const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// const app: Express = express();

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // CORS
// app.use(
//   cors({
//     origin: 'http://localhost:4200',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   })
// );

// // Swagger OpenAPI (yaml)
// const swaggerDocument = YAML.load(
//   path.resolve(process.cwd(), 'apps/api/src/openapi.yaml')
// );
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// // Health check endpoints
// app.get('/', (req, res) => {
//   res.send({ message: 'Hello API' });
// });

// app.get('/health', async (req, res) => {
//   const dbHealthy = await database.healthCheck();
//   res.status(dbHealthy ? 200 : 503).json({
//     status: dbHealthy ? 'healthy' : 'unhealthy',
//     database: dbHealthy ? 'connected' : 'disconnected',
//     timestamp: new Date().toISOString(),
//   });
// });

// // Routes
// userRouter(app);
// studentRouter(app);
// studentStatusHistoryRoute(app);
// app.use('/api', itemRouter); // Router style

// // Server
// app.listen(port, async () => {
//   console.log(`🚀 Ready at http://${host}:${port}`);
//   await database.connect();
//   try {
//     await prisma.$connect();
//     console.log('📦 Connected to Prisma database successfully!');
//   } catch (e) {
//     console.error('❌ Could not connect to Prisma database:', e);
//   }
// });

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   console.log('SIGTERM received, starting graceful shutdown...');
//   await database.disconnect();
//   await prisma.$disconnect();
//   process.exit(0);
// });

// process.on('SIGINT', async () => {
//   console.log('SIGINT received, starting graceful shutdown...');
//   await database.disconnect();
//   await prisma.$disconnect();
//   process.exit(0);
// });

// process.on('beforeExit', async () => {
//   await database.disconnect();
//   await prisma.$disconnect();
// });

// export { app };
// export default app;
