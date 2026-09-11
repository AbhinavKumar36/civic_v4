import app from './app';
import { env } from './config/env';
import mongoose from 'mongoose';
import dns from 'dns';

// Fix for ECONNREFUSED _mongodb._tcp DNS blocking on restrictive networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // fallback if any issue
}

const PORT = parseInt(env.PORT, 10) || 4000;

async function startServer() {
  try {
    // Basic MongoDB connection with retry
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected on app termination');
  process.exit(0);
});

startServer();
