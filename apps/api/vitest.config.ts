import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    hookTimeout: 30_000,
    testTimeout: 20_000,
    // Integration tests share one PostgreSQL database; run files serially.
    fileParallelism: false,
  },
});
