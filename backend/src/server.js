import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'node:path';
import { rateLimit } from 'express-rate-limit';
import contactRoutes from './routes/contact.js';
import assistantRoutes from './routes/assistant.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { prisma } from './db.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();
const port = Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === 'production';
const origins = (process.env.CORS_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500')
  .split(',').map(v => v.trim()).filter(Boolean);

app.disable('x-powered-by');
if (isProduction) app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
  hsts: isProduction ? { maxAge: 15552000, includeSubDomains: true } : false
}));
app.use(cors({
  credentials: true,
  origin(origin, cb) {
    if (!origin || origins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed by CORS'));
  }
}));
app.use(requestLogger);
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve('uploads'), { maxAge: isProduction ? '7d' : '1d', etag: true }));

const apiLimiter = rateLimit({ windowMs: 60_000, limit: 90, standardHeaders: 'draft-8', legacyHeaders: false });
const contactLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false });
const assistantLimiter = rateLimit({ windowMs: 60_000, limit: 25, standardHeaders: 'draft-8', legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });

app.get('/api/health', (_req, res) => res.json({
  ok: true,
  service: 'wallace-portfolio-backend',
  version: '5.0.0',
  environment: process.env.NODE_ENV || 'development',
  time: new Date().toISOString()
}));

app.get('/api/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, database: 'ready', time: new Date().toISOString() });
  } catch {
    res.status(503).json({ ok: false, database: 'unavailable', time: new Date().toISOString() });
  }
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/assistant', assistantLimiter, assistantRoutes);
app.use('/api', apiLimiter, publicRoutes);

app.use((err, req, res, _next) => {
  console.error(JSON.stringify({ level:'error', requestId:req.requestId, message:err?.message || 'Unknown error', time:new Date().toISOString() }));
  if (err?.message === 'Origin not allowed by CORS') return res.status(403).json({ ok:false, error:'Origin not allowed.', requestId:req.requestId });
  res.status(500).json({ ok:false, error:'Unexpected server error.', requestId:req.requestId });
});

const server = app.listen(port, () => console.log(`WALLACE.DEV backend v5 running on http://localhost:${port}`));

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
