import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// The workspace root `.env` holds the shared config; `dotenv` only reads the
// current working directory by default, which is `apps/api` under npm workspaces.
const here = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(here, '../../../../.env') });
loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z
    .string()
    .default('postgres://maktaba:maktaba@127.0.0.1:5432/maktaba'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:8081,http://localhost:19006'),
  JWT_SECRET: z.string().min(8).default('change-me-in-production'),
  JWT_ACCESS_TTL: z.coerce.number().int().default(900),
  JWT_REFRESH_TTL: z.coerce.number().int().default(604800),
  ADMIN_EMAIL: z.string().email().default('admin@maktaba.local'),
  ADMIN_PASSWORD: z.string().min(6).default('admin12345'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
  isTest: parsed.data.NODE_ENV === 'test',
};
export type Env = typeof env;
