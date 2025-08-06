// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // === SOLID PRINCIPLE ANALYSIS (Safe Rules Only) ===
      
      // Single Responsibility Principle (SRP) violations
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      'complexity': ['error', { max: 10 }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      
      // Open/Closed Principle (OCP) violations  
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'prefer-const': 'error',
      
      // Liskov Substitution Principle (LSP) violations
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn', // Warn instead of error
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      
      // Interface Segregation Principle (ISP) violations
      '@typescript-eslint/no-empty-interface': 'error',
      
      // Dependency Inversion Principle (DIP) violations
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      
      // General Code Quality & Architecture
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      
      // Maintainability
      'no-duplicate-imports': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
    }
  }
);