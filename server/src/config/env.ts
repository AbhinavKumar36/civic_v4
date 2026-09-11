import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  TEXTBEE_API_KEY: z.string().min(1, "TEXTBEE_API_KEY is required"),
  TEXTBEE_DEVICE_ID: z.string().min(1, "TEXTBEE_DEVICE_ID is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  OPENWEATHER_API_KEY: z.string().optional()
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
