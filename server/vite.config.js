import { defineConfig } from 'vite';

console.log('loaded SERVER vite.config.js');
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.{js,ts}'], // Match test files in __tests__ folder
    timeout: 60000, // Increase test timeout to 60 seconds (default is 5000ms)
    hookTimeout: 60000,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
    },
  },
});
