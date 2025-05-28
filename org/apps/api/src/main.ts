import express from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

import userRouter from './routes/user.route';


const prisma = new PrismaClient();

const host = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello API!' });
});



userRouter(app);


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
