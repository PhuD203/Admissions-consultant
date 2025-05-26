import express from 'express';
import router from './app/routers/itemRouter';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(
  cors({
    origin: 'http://localhost:4200',
  })
);
app.use('/', router); // dùng router cho đường dẫn gốc '/'
app.use(express.json());

const swaggerDocument = YAML.load(
  path.resolve(process.cwd(), 'apps/api/src/openapi.yaml')
);

app.use(
  cors({
    origin: 'http://localhost:4200', // hoặc '*', hoặc danh sách domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
// Route để xem tài liệu Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/api', router);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
