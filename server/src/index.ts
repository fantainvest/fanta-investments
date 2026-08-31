import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { initDatabase, startAutoSave, saveDatabase } from './config/database';
import { seedDatabase } from './models/seed';
import { apiLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import planRoutes from './routes/plans';
import investmentRoutes from './routes/investments';
import walletRoutes from './routes/wallets';
import depositRoutes from './routes/deposits';
import withdrawalRoutes from './routes/withdrawals';
import adminRoutes from './routes/admin';
import cryptoRoutes from './routes/crypto';
import contentRoutes from './routes/content';
import mpesaRoutes from './routes/mpesa';

const app = express();

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mode: 'production', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/mpesa', mpesaRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n💾 Saving database...');
  saveDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  saveDatabase();
  process.exit(0);
});

// Start server
async function start() {
  console.log('🚀 Initializing Fanta Investments...');

  await initDatabase();
  await seedDatabase();
  startAutoSave();

  console.log('✅ Database ready');

  app.listen(env.PORT, () => {
    console.log(`\n🍊 Fanta Investments API running on port ${env.PORT}`);
    console.log(`🔗 API: http://localhost:${env.PORT}/api`);
    console.log(`📊 Mode: PRODUCTION (real database)\n`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});
