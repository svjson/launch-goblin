import { defineConfig } from 'eslint/config'
import typescriptEslint from 'typescript-eslint'
import nPlugin from 'eslint-plugin-n'
import js from '@eslint/js'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  {
    files: ['src/**/*.{ts,d.ts}', 'test/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      parser: typescriptEslint.parser,
      parserOptions: {
        projectService: true,
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
      import: importPlugin,
      n: nPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      node: {
        tryExtensions: ['.js', '.ts'],
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,
      ...prettier.rules,
      ...importPlugin.configs.typescript.rules,
      ...nPlugin.configs.recommended.rules,
      'n/no-unsupported-features/es-syntax': [
        'error',
        {
          ignores: ['modules'],
        },
      ],
      'no-useless-catch': 'warn',
      'n/no-missing-import': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-control-regex': 'off',
      'n/no-process-exit': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      'n/no-unpublished-import': 'off',
    },
  },
])
