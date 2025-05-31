
import express, { Express } from 'express';
import { database } from './config/db.config';
import { specs, swaggerUi } from './docs/swagger';

import userRouter from './routes/user.route';
import studentRouter from './routes/student.route';
import studentStatusHistoryRoute from "./routes/student-status-history.route";

const host = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API!' });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealthy = await database.healthCheck();
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
userRouter(app);
studentRouter(app);
studentStatusHistoryRoute(app)

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
