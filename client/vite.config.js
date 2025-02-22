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
    include: ['src/__tests__/**/*.test.{js,jsx}'], // Only include .test.js/.test.jsx files in the client folder
  },
});
