import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      '*.min.js',
      'public',
      '.vscode',
      'build',
      '.git',
      'audit-reports/**/*',
      'storybook-static/**/*',
      'migration-tests/**/*',
      '**/*.min.js',
      '**/*.bundle.js',
    ],
  },

  // Base TypeScript configuration
  ...tseslint.configs.recommended,

  // TypeScript files with type checking
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React rules
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-unescaped-entities': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error for flexibility
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // General rules
      'prefer-const': 'error',

      // General ESLint rules (relaxed for development)
      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'error',

      // Custom theme compliance rules (warnings for now, will be errors in production)
      'no-restricted-syntax': [
        'warn',
        {
          'selector': 'Literal[value=/^(#[0-9a-f]{3,8}|rgb\\(|rgba\\(|hsl\\(|hsla\\()/i]',
          'message': 'Avoid hardcoded colors. Use CSS variables from the theme system instead.'
        },
        {
          'selector': 'TemplateLiteral > TemplateElement[value.raw=/bg-(red|blue|green|yellow|purple|pink|indigo|gray|black|white)-\\d+/]',
          'message': 'Avoid hardcoded Tailwind color classes. Use CSS variables like bg-[var(--theme-primary)] instead.'
        }
      ]
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // JavaScript and config files without type checking
  {
    files: ['**/*.{js,jsx,cjs,mjs}', '*.config.{js,ts}', 'scripts/**/*', '.storybook/**/*', 'vite.config.ts', 'vitest.config.ts', '.eslintrc-theme-rules.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Disable TypeScript-specific rules for JS files
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Allow console in config files
      'no-console': 'off',

      // React rules for JSX files
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // Prettier config must be last to override conflicting rules
  prettierConfig
);
