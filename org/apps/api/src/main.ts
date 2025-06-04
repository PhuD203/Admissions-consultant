// import express from 'express';
// // @ts-ignore
// import { PrismaClient } from '@prisma/client';

// import userRouter from './routes/user.route';

// const prisma = new PrismaClient();

// const host = process.env.HOST ?? 'localhost';
// const port = Number(process.env.PORT ?? 3000);

// const app = express();

// app.get('/', (req, res) => {
//   res.send({ message: 'Hello API!' });
// });

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
// });

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

import userRouter from './routes/user.route';
import itemRouter from './app/routers/itemRouter';

const prisma = new PrismaClient();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Swagger documentation
const swaggerDocument = YAML.load(
  path.resolve(process.cwd(), 'apps/api/src/openapi.yaml')
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

// Routes
userRouter(app); // dạng function(app)
app.use('/api', itemRouter); // dạng router (express.Router)

app.listen(port, async () => {
  console.log(`🚀 Ready at http://${host}:${port}`);

  try {
    await prisma.$connect();
    console.log('📦 Connected to Prisma database successfully!');
  } catch (e) {
    console.error('❌ Could not connect to Prisma database:', e);
  }
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Disconnected from Prisma database.');
});
