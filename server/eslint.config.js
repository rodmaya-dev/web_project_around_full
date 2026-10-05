import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
      'no-console': 'off', // o ["warn", { allow: ["warn", "error", "log"] }]
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ], // ESLint no distingue entre "de verdad se te olvidó" y "lo necesito por la firma de la función pero no lo uso"
    },
  },
];
