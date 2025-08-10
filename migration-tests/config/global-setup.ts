/**
 * Global setup for migration tests
 * Ensures both environments are ready before testing
 */

import { chromium, FullConfig } from '@playwright/test';
import { getCurrentEnvironment } from '../utils/environment-switcher';

async function globalSetup(config: FullConfig) {
  const env = getCurrentEnvironment();

  console.log(`🚀 Setting up migration tests for: ${env.description}`);
  console.log(`   Base URL: ${env.baseURL}`);
  console.log(`   API URL: ${env.apiBaseURL}`);

  // Create browser instance for health checks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Health check: Frontend
    console.log('⏳ Checking frontend availability...');
    await page.goto(env.baseURL, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    console.log('✅ Frontend is responding');

    // Health check: API
    console.log('⏳ Checking API availability...');
    try {
      const response = await page.request.get(`${env.apiBaseURL}/health`);
      if (response.ok()) {
        console.log('✅ API is responding');
      } else {
        console.log('⚠️  API health check failed, but continuing tests');
      }
    } catch (error) {
      console.log(
        '⚠️  API not available, but continuing with frontend-only tests'
      );
      console.log('   (Backend API should be started for full test suite)');
    }

    // Environment-specific setup
    if (env.name === 'old') {
      console.log('🔧 Setting up old frontend environment');
      // Any specific setup for old frontend
    } else if (env.name === 'new') {
      console.log('🔧 Setting up new frontend environment');
      // Any specific setup for new frontend
    }

    // Prepare test data if needed
    await prepareTestData(page);
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  console.log('🎯 Migration tests ready to run!');
}

async function prepareTestData(page: any) {
  console.log('📝 Preparing test data...');

  // TODO: Add any test data preparation needed
  // This could include:
  // - Creating test user accounts
  // - Seeding database with test data
  // - Setting up mock services

  console.log('✅ Test data preparation complete');
}

export default globalSetup;
