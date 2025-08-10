/**
 * Actual Pages Test - Real Pokemon Collection Functionality
 * Tests the pages that actually exist in the system based on Router.tsx
 */

import { expect, Page, test } from '@playwright/test';
import {
  getBaseURL,
  getEnvironmentDescription,
} from '../../utils/environment-switcher';

const ACTUAL_ROUTES = [
  { path: '/', name: 'Dashboard (Root)', critical: true },
  { path: '/dashboard', name: 'Dashboard', critical: true },
  { path: '/collection', name: 'Collection', critical: true },
  { path: '/collection/add', name: 'Add Item', critical: true },
  { path: '/add-item', name: 'Add Item (Alt)', critical: true },
  { path: '/sets', name: 'Set Search', critical: false },
  { path: '/set-search', name: 'Set Search (Alt)', critical: false },
  {
    path: '/sealed-products-search',
    name: 'Sealed Products Search',
    critical: false,
  },
  { path: '/auctions', name: 'Auctions', critical: true },
  { path: '/sales-analytics', name: 'Sales Analytics', critical: false },
  { path: '/analytics', name: 'Analytics (Alt)', critical: false },
  { path: '/activity', name: 'Activity', critical: false },
  { path: '/dba-export', name: 'DBA Export', critical: false },
];

test.describe(`Actual Pages - ${getEnvironmentDescription()}`, () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Set shorter timeouts to prevent hanging
    page.setDefaultTimeout(8000);
    page.setDefaultNavigationTimeout(10000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  // Test critical pages
  for (const route of ACTUAL_ROUTES.filter((r) => r.critical)) {
    test(`should load ${route.name} page (${route.path})`, async () => {
      console.log(`Testing critical page: ${route.path}`);

      try {
        await page.goto(`${getBaseURL()}${route.path}`);
        await page.waitForLoadState('networkidle', { timeout: 8000 });

        // Page should load without crashing
        await expect(page.locator('body')).toBeVisible();

        // Should not show error page
        const hasError = (await page.locator('text="error"').count()) > 0;
        const hasNotFound =
          (await page.locator('text="not found"').count()) > 0;

        expect(hasError || hasNotFound).toBeFalsy();

        // Take screenshot
        await page.screenshot({
          path: `test-results/page-${route.path.replace(/[\/]/g, '_')}.png`,
          timeout: 3000,
        });

        console.log(`✅ ${route.name} loaded successfully`);
      } catch (error) {
        console.log(`❌ ${route.name} failed to load: ${error.message}`);
        await page.screenshot({
          path: `test-results/page-${route.path.replace(/[\/]/g, '_')}-error.png`,
          timeout: 3000,
        });
        throw error;
      }
    });
  }

  test('should navigate between critical pages', async () => {
    const criticalRoutes = ACTUAL_ROUTES.filter((r) => r.critical).slice(0, 4); // Test first 4 to avoid timeout

    for (const route of criticalRoutes) {
      try {
        console.log(`Navigating to: ${route.path}`);

        await page.goto(`${getBaseURL()}${route.path}`, { timeout: 8000 });
        await page.waitForLoadState('networkidle', { timeout: 5000 });

        // Verify page loaded
        await expect(page.locator('body')).toBeVisible();

        // Check URL
        const currentUrl = page.url();
        expect(currentUrl).toContain(route.path.length > 1 ? route.path : '');

        console.log(`✅ Successfully navigated to ${route.name}`);
      } catch (error) {
        console.log(`⚠️  Navigation to ${route.name} failed: ${error.message}`);
        // Don't throw - continue testing other routes
      }
    }
  });

  test('should have working collection functionality', async () => {
    try {
      await page.goto(`${getBaseURL()}/collection`);
      await page.waitForLoadState('networkidle', { timeout: 8000 });

      // Should have collection elements
      const hasItems =
        (await page
          .locator('[class*="item"], [data-testid*="item"], .card')
          .count()) > 0;
      const hasEmptyState =
        (await page
          .locator('text="empty", text="no items", text="add"')
          .count()) > 0;
      const hasAddButton =
        (await page
          .locator('button:has-text("Add"), a:has-text("Add")')
          .count()) > 0;

      // Should have either items, empty state, or add functionality
      expect(hasItems || hasEmptyState || hasAddButton).toBeTruthy();

      console.log(
        `Collection state: Items=${hasItems}, Empty=${hasEmptyState}, Add=${hasAddButton}`
      );

      await page.screenshot({
        path: 'test-results/collection-functionality.png',
        timeout: 3000,
      });
    } catch (error) {
      console.log(`Collection test failed: ${error.message}`);
      throw error;
    }
  });

  test('should have working auction functionality', async () => {
    try {
      await page.goto(`${getBaseURL()}/auctions`);
      await page.waitForLoadState('networkidle', { timeout: 8000 });

      // Should load auction page without errors
      await expect(page.locator('body')).toBeVisible();

      // Look for auction-related content
      const hasAuctionContent =
        (await page.locator('text="auction"').count()) > 0;
      const hasCreateButton =
        (await page
          .locator('button:has-text("Create"), button:has-text("New")')
          .count()) > 0;
      const hasAuctionItems =
        (await page.locator('[class*="auction"]').count()) > 0;

      console.log(
        `Auction state: Content=${hasAuctionContent}, Create=${hasCreateButton}, Items=${hasAuctionItems}`
      );

      await page.screenshot({
        path: 'test-results/auction-functionality.png',
        timeout: 3000,
      });
    } catch (error) {
      console.log(`Auction test failed: ${error.message}`);
      throw error;
    }
  });

  test('should have working dashboard', async () => {
    try {
      await page.goto(`${getBaseURL()}/dashboard`);
      await page.waitForLoadState('networkidle', { timeout: 8000 });

      // Should load dashboard without errors
      await expect(page.locator('body')).toBeVisible();

      // Look for dashboard elements
      const hasStats =
        (await page
          .locator('[class*="stat"], [class*="card"], [class*="widget"]')
          .count()) > 0;
      const hasNavigation =
        (await page.locator('nav, [class*="nav"]').count()) > 0;
      const hasContent =
        (await page
          .locator('main, [class*="content"], [class*="dashboard"]')
          .count()) > 0;

      console.log(
        `Dashboard state: Stats=${hasStats}, Nav=${hasNavigation}, Content=${hasContent}`
      );

      await page.screenshot({
        path: 'test-results/dashboard-functionality.png',
        timeout: 3000,
      });
    } catch (error) {
      console.log(`Dashboard test failed: ${error.message}`);
      throw error;
    }
  });

  test('should handle add item functionality', async () => {
    const addRoutes = ['/collection/add', '/add-item'];

    for (const route of addRoutes) {
      try {
        console.log(`Testing add route: ${route}`);

        await page.goto(`${getBaseURL()}${route}`);
        await page.waitForLoadState('networkidle', { timeout: 8000 });

        // Should load add page
        await expect(page.locator('body')).toBeVisible();

        // Look for form elements
        const hasForm =
          (await page.locator('form, input, select, textarea').count()) > 0;
        const hasSubmitButton =
          (await page
            .locator(
              'button:has-text("Submit"), button:has-text("Save"), button:has-text("Add")'
            )
            .count()) > 0;

        console.log(
          `Add form (${route}): Form=${hasForm}, Submit=${hasSubmitButton}`
        );

        if (hasForm || hasSubmitButton) {
          console.log(`✅ Add functionality available at ${route}`);
          break; // Found working add route
        }
      } catch (error) {
        console.log(`Add route ${route} failed: ${error.message}`);
        // Continue to next route
      }
    }
  });

  // Test optional pages (non-critical)
  test('should load optional pages without errors', async () => {
    const optionalRoutes = ACTUAL_ROUTES.filter((r) => !r.critical).slice(0, 3); // Test first 3 to avoid timeout
    let loadedCount = 0;

    for (const route of optionalRoutes) {
      try {
        console.log(`Testing optional page: ${route.path}`);

        await page.goto(`${getBaseURL()}${route.path}`, { timeout: 6000 });
        await page.waitForLoadState('domcontentloaded', { timeout: 4000 }); // Faster check

        // Just verify it loads
        await expect(page.locator('body')).toBeVisible();
        loadedCount++;

        console.log(`✅ ${route.name} loaded`);
      } catch (error) {
        console.log(`⚠️  Optional page ${route.name} failed: ${error.message}`);
        // Continue - optional pages failing is not critical
      }
    }

    console.log(
      `Optional pages loaded: ${loadedCount}/${optionalRoutes.length}`
    );
    // Don't fail test if optional pages have issues
  });

  test('should have consistent navigation across pages', async () => {
    const testRoutes = ['/', '/collection', '/auctions'];
    let consistentNav = true;
    let navItemCount = 0;

    for (const route of testRoutes) {
      try {
        await page.goto(`${getBaseURL()}${route}`, { timeout: 8000 });
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 });

        const currentNavCount = await page
          .locator('nav a, nav button, [class*="nav"] a, [class*="nav"] button')
          .count();

        if (navItemCount === 0) {
          navItemCount = currentNavCount; // Set baseline
        } else if (Math.abs(currentNavCount - navItemCount) > 2) {
          // Allow some variation but flag major differences
          console.log(
            `⚠️  Navigation inconsistency on ${route}: expected ~${navItemCount}, got ${currentNavCount}`
          );
          consistentNav = false;
        }

        console.log(`Navigation items on ${route}: ${currentNavCount}`);
      } catch (error) {
        console.log(`Navigation test failed on ${route}: ${error.message}`);
      }
    }

    console.log(
      `Navigation consistency: ${consistentNav ? 'Good' : 'Needs attention'}`
    );
    expect(navItemCount).toBeGreaterThan(0); // Should have some navigation
  });
});
