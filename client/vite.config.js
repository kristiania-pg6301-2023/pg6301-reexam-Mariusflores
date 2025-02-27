import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

console.log('Loaded CLIENT vite.config.js');

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Makes describe, it, expect available globally
    timeout: 60000, // Increase test timeout to 60 seconds
    hookTimeout: 60000,
    environment: 'jsdom', // Simulate browser for frontend testing
    setupFiles: '__tests__/setupTests.js', // Setup file for global test configs
    coverage: {
      provider: 'istanbul', // Use NYC-compatible provider
      reporter: ['text', 'lcov'], // Generate text & lcov reports
    },
    include: ['__tests__/**/*.test.{js,jsx,ts,tsx}'], // Match test files
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
