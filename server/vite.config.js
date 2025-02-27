import { defineConfig } from 'vite';
import { resolve } from 'path';

console.log('Loaded SERVER vite.config.js');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Use Node.js for backend testing
    include: ['__tests__/**/*.test.{js,ts}'], // Match test files in __tests__ folder
    timeout: 60000, // Increase test timeout to 60 seconds
    hookTimeout: 60000,
    coverage: {
      provider: 'istanbul', // Use NYC-compatible provider
      reporter: ['text', 'lcov'], // Ensure lcov for CI integration
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
