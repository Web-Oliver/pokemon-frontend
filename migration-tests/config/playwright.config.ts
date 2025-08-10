/**
 * Playwright Configuration for Migration Testing
 * Supports testing both old and new frontends with same test suite
 */

import { defineConfig, devices } from '@playwright/test';
import { getCurrentEnvironment } from '../utils/environment-switcher';

// Get environment info
const env = getCurrentEnvironment();

export default defineConfig({
  testDir: '../e2e',
  
  // Test configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: `../reports/${env.name}-html` }],
    ['json', { outputFile: `../reports/${env.name}-results.json` }],
    ['junit', { outputFile: `../reports/${env.name}-junit.xml` }],
    ['list'],
  ],

  // Global test configuration
  use: {
    baseURL: env.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Test identification
    extraHTTPHeaders: {
      'X-Test-Environment': env.name,
      'X-Test-Description': env.description,
    },
  },

  // Project configurations for different browsers
  projects: [
    {
      name: `chromium-${env.name}`,
      use: { 
        ...devices['Desktop Chrome'],
        // Additional context for this environment
        contextOptions: {
          recordVideo: {
            dir: `../videos/${env.name}/chromium`,
            size: { width: 1280, height: 720 }
          }
        }
      },
    },
    
    {
      name: `firefox-${env.name}`,
      use: { 
        ...devices['Desktop Firefox'],
        contextOptions: {
          recordVideo: {
            dir: `../videos/${env.name}/firefox`,
            size: { width: 1280, height: 720 }
          }
        }
      },
    },

    {
      name: `webkit-${env.name}`,
      use: { 
        ...devices['Desktop Safari'],
        contextOptions: {
          recordVideo: {
            dir: `../videos/${env.name}/webkit`,
            size: { width: 1280, height: 720 }
          }
        }
      },
    },

    // Mobile testing
    {
      name: `mobile-chrome-${env.name}`,
      use: { 
        ...devices['Pixel 5'],
        contextOptions: {
          recordVideo: {
            dir: `../videos/${env.name}/mobile-chrome`,
            size: { width: 393, height: 851 }
          }
        }
      },
    },
  ],

  // Web server configuration (if needed for new frontend)
  webServer: env.name === 'new' ? {
    command: 'npm run dev',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  } : undefined,

  // Test timeouts
  timeout: 15000,  // Reduced from 30s to 15s
  expect: {
    timeout: 3000,   // Reduced from 5s to 3s
  },

  // Test output directories
  outputDir: `../test-results/${env.name}`,
  
  // Global setup/teardown
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),
});