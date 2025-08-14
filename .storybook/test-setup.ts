// Test setup for Storybook test runner
import { beforeAll, afterAll } from '@jest/globals';
import { configureAxe, toHaveNoViolations } from 'jest-axe';

// Configure accessibility testing
configureAxe({
  rules: {
    // Disable color-contrast checking for now (we handle this manually)
    'color-contrast': { enabled: false },
    // Focus on critical accessibility issues
    'aria-hidden-focus': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
  },
});

// Extend Jest matchers
expect.extend(toHaveNoViolations);

beforeAll(() => {
  // Set up any global test configuration
  console.log('🧪 Starting Storybook visual regression tests...');
});

afterAll(() => {
  console.log('✅ Storybook tests completed');
});