// eslint.config.js in root (backend configuration)
import js from '@eslint/js';
import globals from 'globals';

export default {
  env: {
    node: true,  // For backend (Node.js)
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    // Other backend specific rules
  },
};
