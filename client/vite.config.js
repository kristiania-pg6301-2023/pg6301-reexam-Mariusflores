import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log('loaded CLIENT vitest.config.js');
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  test: {
    globals: true, // Makes describe, it, expect available globally
    timeout: 60000, // Increase test timeout to 60 seconds (default is 5000ms)
    hookTimeout: 60000,
    environment: 'jsdom', // Use jsdom for frontend testing (simulate browser)
    setupFiles: './__tests__/setupTests.js',
    coverage: {
      provider: 'istanbul', // Coverage provider
      reporter: ['text', 'html'], // Report coverage in both text and HTML formats
    },
    include: ['__tests__/**/*.test.{js,jsx}'], // Only include .test.js/.test.jsx files in the client folder
  },
});
