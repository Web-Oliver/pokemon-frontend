import typescriptEslint from '@typescript-eslint/eslint-plugin';
import sonarjs from 'eslint-plugin-sonarjs';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'sonarjs': sonarjs
    },
    rules: {
      // SOLID Principle Violations
      // Single Responsibility Principle (SRP)
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', { threshold: 5 }],
      'sonarjs/prefer-single-boolean-return': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-small-switch': 'off',
      
      // Open/Closed Principle (OCP)
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      
      // Liskov Substitution Principle (LSP)
      'sonarjs/no-inverted-boolean-check': 'error',
      
      // Interface Segregation Principle (ISP)
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/no-identical-expressions': 'error',
      
      // Dependency Inversion Principle (DIP)
      'sonarjs/no-nested-template-literals': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      
      // General Code Quality
      'sonarjs/max-switch-cases': ['error', 30],
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-element-overwrite': 'error',
      'sonarjs/no-extra-arguments': 'error',
      'sonarjs/no-gratuitous-expressions': 'error',
      'sonarjs/no-one-iteration-loop': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-use-of-empty-return-value': 'error',
      'sonarjs/non-existent-operator': 'error'
    }
  }
];