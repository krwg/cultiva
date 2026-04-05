import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',      
      'no-console': 'off',          
      'no-undef': 'warn',            
    },
    ignores: ['node_modules/', 'dist/', 'vite.config.js'],
  },
];