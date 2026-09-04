import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import searchRoutes from './routes/search';
import leadRoutes from './routes/leads';
import campaignRoutes from './routes/campaigns';
import userRoutes from './routes/user';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';

export const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/search', rateLimiter('search', 30, 60), authMiddleware, searchRoutes);
app.use('/api/leads', rateLimiter('leads', 60, 60), authMiddleware, leadRoutes);
app.use('/api/campaigns', rateLimiter('campaigns', 30, 60), authMiddleware, campaignRoutes);
app.use('/api/user', authMiddleware, userRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
