import { config } from '@ellefe/eslint-config';
import eslintPrettierConfig from 'eslint-config-prettier';

/** @type {import('typescript-eslint').ConfigArray} */
export default [
  ...config(true, import.meta.dirname),
  {
    files: ['scripts/**/*'],
    rules: {
      'no-console': 'off',

      'jsdoc/require-jsdoc': 'off',
    },
  },
  eslintPrettierConfig,
];
