import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  test: {
    globals: true, // Makes describe, it, expect available globally
    environment: 'jsdom', // Use jsdom for frontend testing (simulate browser)
    coverage: {
      provider: 'istanbul', // Coverage provider
      reporter: ['text', 'html'], // Report coverage in both text and HTML formats
    },
    include: ['__tests__/**/*.test.{js,ts}'], // Only include .test.js/.test.ts files in the client folder
  },
});
