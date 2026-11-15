import { beforeAll, afterAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgres://maktaba:maktaba@127.0.0.1:5432/maktaba_test';

// Imported after the env is set so the pool connects to the test database.
const { migrate } = await import('../src/db/migrate.js');
const { seed } = await import('../src/db/seed.js');
const { resetSchema } = await import('../src/db/reset.js');
const { pool } = await import('../src/db/pool.js');

beforeAll(async () => {
  await resetSchema();
  await migrate();
  await seed();
});

afterAll(async () => {
  await pool.end();
});
