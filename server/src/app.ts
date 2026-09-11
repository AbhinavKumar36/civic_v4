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

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'OK', timestamp: new Date() } });
});

export default app;
