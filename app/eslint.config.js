// @ts-ignore -- no types for this module
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
// @ts-ignore -- no types for this plugin
import drizzle from 'eslint-plugin-drizzle'
import nextPlugin from '@next/eslint-plugin-next'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['.next', '**/.next/**'],
  },
  {
    // Apply to all files
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node, // This adds 'process' and other Node.js globals
      },
    },
  },
  // Next.js configuration
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    // @ts-ignore -- type mismatch for Next.js plugin rules
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  // TypeScript and Drizzle configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      drizzle,
    },
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: ['db', 'ctx.db'] }],
      'drizzle/enforce-update-with-where': ['error', { drizzleObjectName: ['db', 'ctx.db'] }],
    },
  },
  {
    // Global parser options
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
)
