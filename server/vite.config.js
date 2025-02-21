import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.{js,ts}'], // Match test files in __tests__ folder
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
    },
  },
});
