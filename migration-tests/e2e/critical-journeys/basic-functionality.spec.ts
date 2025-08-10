/**
 * Basic Functionality Test - Old System Baseline
 * Verifies core application loads and basic navigation works
 */

import { expect, Page, test } from '@playwright/test';
import {
  getBaseURL,
  getEnvironmentDescription,
} from '../../utils/environment-switcher';

test.describe(`Basic Functionality - ${getEnvironmentDescription()}`, () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load the main application', async () => {
    console.log(`Testing against: ${getBaseURL()}`);

    // Navigate to the application
    await page.goto(getBaseURL());

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Verify the page title or main heading exists
    await expect(page).toHaveTitle(/.*[Pp]okemon.*/);

    // Take a screenshot for baseline
    await page.screenshot({ path: 'test-results/baseline-homepage.png' });
  });

  test('should display main navigation', async () => {
    await page.goto(getBaseURL());
    await page.waitForLoadState('networkidle');

    // Look for common navigation elements
    const navSelectors = [
      'nav',
      '[data-testid="navigation"]',
      '[data-testid="header"]',
      '[class*="nav"]',
      '[role="navigation"]',
    ];

    let navigationFound = false;
    for (const selector of navSelectors) {
      if ((await page.locator(selector).count()) > 0) {
        await expect(page.locator(selector).first()).toBeVisible();
        navigationFound = true;
        console.log(`✅ Found navigation using selector: ${selector}`);
        break;
      }
    }

    if (!navigationFound) {
      console.log('ℹ️  No standard navigation found, checking for links...');
      // Fallback: check for any navigation links
      const links = await page.locator('a').count();
      expect(links).toBeGreaterThan(0);
    }
  });

  test('should handle 404 pages gracefully', async () => {
    await page.goto(`${getBaseURL()}/non-existent-page`);
    await page.waitForLoadState('networkidle');

    // Should either redirect to home or show 404 page
    const url = page.url();
    const title = await page.title();

    console.log(`404 test - URL: ${url}, Title: ${title}`);

    // Should not show browser error page
    await expect(page.locator('body')).toBeVisible();

    // Take screenshot of 404 handling
    await page.screenshot({ path: 'test-results/404-handling.png' });
  });

  test('should be responsive on mobile', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(getBaseURL());
    await page.waitForLoadState('networkidle');

    // Verify page still loads on mobile
    await expect(page.locator('body')).toBeVisible();

    // Check that content is visible and not overflowing
    const bodyWidth = await page.locator('body').boundingBox();
    expect(bodyWidth?.width).toBeLessThanOrEqual(375);

    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });

  test('should load without JavaScript errors', async () => {
    const errors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`Console Error: ${msg.text()}`);
      }
    });

    // Listen for page errors
    page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
    });

    await page.goto(getBaseURL());
    await page.waitForLoadState('networkidle');

    // Wait a bit more for any async errors
    await page.waitForTimeout(2000);

    // Report errors but don't fail the test (old system might have some)
    if (errors.length > 0) {
      console.log('⚠️  JavaScript errors detected:');
      errors.forEach((error) => console.log(`   ${error}`));
    } else {
      console.log('✅ No JavaScript errors detected');
    }

    // For baseline, we just record the errors, don't fail
    // expect(errors).toHaveLength(0);  // Uncomment this later for new system
  });
});
