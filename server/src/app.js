import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import monitorRoutes from './routes/monitorRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api', monitorRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

export default app;
