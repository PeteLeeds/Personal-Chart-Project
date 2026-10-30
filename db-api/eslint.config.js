import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([{
    ignores: ['package.json', 'tsconfig.json'],
},
{
  files: ['db-scripts/**/*.{js,ts}'],
  extends: [js.configs.recommended, tseslint.configs.recommended],
}]);