module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:sonarjs/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sonarjs'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    // SOLID Principle Violations
    // Single Responsibility Principle (SRP)
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': ['error', 5],
    'sonarjs/prefer-single-boolean-return': 'error',
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-small-switch': 'off', // Can be useful for state machines
    
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
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.config.js',
    '*.config.ts'
  ]
};