import { readFileSync } from 'node:fs'

import globals from 'globals'
import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactDom from 'eslint-plugin-react-dom'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactX from 'eslint-plugin-react-x'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// eslint-plugin-react's `version: 'detect'` does a plain `require('react')`,
// which only walks up from its own node_modules — pnpm's per-package
// isolation means that never reaches frontend/node_modules/react. Derive
// the version straight from frontend/package.json instead, so it tracks
// future React bumps there without needing manual edits here.
const { dependencies: frontendDependencies } = JSON.parse(
  readFileSync(new URL('./frontend/package.json', import.meta.url), 'utf-8'),
)
const reactVersion = frontendDependencies.react.replace(/^[\^~]/, '')

export default defineConfig([
  globalIgnores(['**/dist', '**/coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      jsxA11y.flatConfigs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactDom.configs.recommended,
      reactX.configs['strict-type-checked'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // No manual `plugins` key needed — the flat configs above register them
    rules: {
      'react-x/no-class-component': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-dynamic-delete': 'warn',
      '@typescript-eslint/no-misused-promises': [
        2,
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      // Allow unused variables only when prefixed with '_'.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: {
        version: reactVersion,
        defaultVersion: '19',
      },
    },
  },
])
