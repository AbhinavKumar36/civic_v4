import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

async function seedDemoUsers() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB for seeding demo users');

  // 1. Authority user: admin@civicpulse.gov / admin123
  const authorityPassword = await bcrypt.hash('admin123', 10);
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
  console.log('✅ Authority user created: admin@civicpulse.gov / admin123');

  // 2. Worker user: W-882 / worker123
  const workerPassword = await bcrypt.hash('worker123', 10);
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
  console.log('✅ Worker user created: W-882 / worker123');

  await mongoose.disconnect();
  console.log('🎉 Demo users seeded successfully!');
}

seedDemoUsers().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
