import express from 'express';
import cors from 'cors';
import todosRouter from './routes/todos.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthcheck } from './healthcheck.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', healthcheck);
app.use('/api/todos', todosRouter);

app.use(errorHandler);

export default app;
