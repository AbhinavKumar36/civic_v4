import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import civicInputsRoutes from './routes/civic-inputs.routes';
import intelligenceRoutes from './routes/intelligence.routes';
import datasetRoutes from './routes/dataset.routes';
import evidenceRoutes from './routes/evidence.routes';
import proposalRoutes from './routes/proposal.routes';
import priorityRoutes from './routes/priority.routes';
import portfolioRoutes from './routes/portfolio.routes';
import aadhaarRoutes from './routes/aadhaar.routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/civic-inputs', civicInputsRoutes);
app.use('/api/v1/intelligence', intelligenceRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/evidence', evidenceRoutes);
app.use('/api/v1/proposals', proposalRoutes);
app.use('/api/v1/priorities', priorityRoutes);
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/aadhaar', aadhaarRoutes);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'OK', timestamp: new Date() } });
});

// One-time demo user seed endpoint (dev only)
app.post('/api/v1/seed-demo-users', async (req, res) => {
  try {
    const bcryptLib = await import('bcrypt');
    const { User } = await import('./models/User');
    
    // 1. Authority user
    const authorityPassword = await bcryptLib.default.hash('admin123', 10);
    await User.findOneAndUpdate(
      { email: 'admin@civicpulse.gov' },
      {
        $set: {
          phone: '0000000001',
          email: 'admin@civicpulse.gov',
          password: authorityPassword,
          name: 'Admin Officer',
          role: 'AUTHORITY',
          isVerified: true,
          identityStatus: 'VERIFIED',
          verifiedVia: 'MANUAL'
        }
      },
      { upsert: true, new: true }
    );

    // 2. Worker user
    const workerPassword = await bcryptLib.default.hash('worker123', 10);
    await User.findOneAndUpdate(
      { phone: 'W-882' },
      {
        $set: {
          phone: 'W-882',
          name: 'Field Worker #882',
          password: workerPassword,
          role: 'WORKER',
          isVerified: true,
          identityStatus: 'VERIFIED',
          verifiedVia: 'MANUAL'
        }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { message: 'Demo users seeded: admin@civicpulse.gov/admin123 and W-882/worker123' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default app;
