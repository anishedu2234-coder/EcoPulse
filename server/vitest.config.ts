import { defineConfig } from 'vitest/config';

process.env.JWT_SECRET = 'testsecret';

export default defineConfig({
  test: {
    globals: true,
  },
});
