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

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', rateLimiter('search', 30, 60), authMiddleware, searchRoutes);
app.use('/api/leads', rateLimiter('leads', 60, 60), authMiddleware, leadRoutes);
app.use('/api/campaigns', rateLimiter('campaigns', 30, 60), authMiddleware, campaignRoutes);
app.use('/api/user', authMiddleware, userRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

// Seed database on startup
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // const seedService = new SeedService();
    // await seedService.ensureLeadsExist();

    app.listen(PORT, () => {
      console.log(`🚀 API Server running on http://localhost:${PORT}`);
      console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();