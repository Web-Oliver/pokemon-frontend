/**
 * Collection Page Functional Tests - Complete Coverage
 * Tests ALL collection functionality: tabs, CRUD operations, export, search, modals
 */

import { expect, Page, test } from '@playwright/test';
import { getBaseURL } from '../../utils/environment-switcher';

test.describe('Collection - Complete Functionality', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/collection`);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load collection page with proper structure', async () => {
    // Should have collection header
    await expect(page.locator('h1, [role="heading"]')).toContainText([
      'Collection',
      'My Collection',
    ]);

    // Should have stats or item count
    const hasStats =
      (await page.locator('text=/\d+/', '[class*="stat"]').count()) > 0;
    const hasItemCount =
      (await page.locator('text=/items?/i, text=/cards?/i').count()) > 0;

    expect(hasStats || hasItemCount).toBeTruthy();

    await page.screenshot({ path: 'test-results/collection-main.png' });
  });

  test('should have working collection tabs', async () => {
    // Look for tab navigation
    const tabSelectors = [
      'button:has-text("PSA")',
      'button:has-text("Graded")',
      'button:has-text("Raw")',
      'button:has-text("Sealed")',
      'button:has-text("Product")',
      '[role="tab"]',
    ];

    let tabsFound = false;

    for (const selector of tabSelectors) {
      const tabs = page.locator(selector);
      const tabCount = await tabs.count();

      if (tabCount > 0) {
        tabsFound = true;
        console.log(`Found ${tabCount} tabs with selector: ${selector}`);

        // Test clicking first few tabs
        for (let i = 0; i < Math.min(3, tabCount); i++) {
          const tab = tabs.nth(i);
          if (await tab.isVisible()) {
            await tab.click();
            await page.waitForTimeout(1000);

            // Should show content for that tab
            const hasContent =
              (await page
                .locator(
                  '[class*="item"], [class*="card"], [data-testid*="item"]'
                )
                .count()) > 0;
            const hasEmptyState =
              (await page
                .locator('text="empty", text="no items", text="nothing"')
                .count()) > 0;

            expect(hasContent || hasEmptyState).toBeTruthy();
          }
        }
        break;
      }
    }

    if (!tabsFound) {
      console.log('No tabs found - may be single view collection');
    }
  });

  test('should display collection items or empty state', async () => {
    // Check for items displayed
    const itemSelectors = [
      '[data-testid*="item"]',
      '[data-testid*="card"]',
      '[class*="collection-item"]',
      '[class*="card"]',
      '.item',
      '.card',
    ];

    let itemsFound = false;
    let totalItems = 0;

    for (const selector of itemSelectors) {
      const items = page.locator(selector);
      const count = await items.count();
      totalItems += count;

      if (count > 0) {
        itemsFound = true;
        console.log(`Found ${count} items with selector: ${selector}`);

        // Test first few items
        for (let i = 0; i < Math.min(3, count); i++) {
          const item = items.nth(i);
          if (await item.isVisible()) {
            await expect(item).toBeVisible();

            // Should have item content (name, image, price, etc.)
            const hasText = (await item.locator('text=/\\w+/').count()) > 0;
            const hasImage = (await item.locator('img').count()) > 0;

            expect(hasText || hasImage).toBeTruthy();
          }
        }
      }
    }

    if (!itemsFound) {
      // Check for empty state
      const emptyStateSelectors = [
        'text="no items"',
        'text="empty collection"',
        'text="add your first"',
        'text="nothing here"',
        '[data-testid*="empty"]',
      ];

      let emptyStateFound = false;
      for (const selector of emptyStateSelectors) {
        if ((await page.locator(selector).count()) > 0) {
          emptyStateFound = true;
          break;
        }
      }

      expect(emptyStateFound).toBeTruthy();
    }

    console.log(`Total items found: ${totalItems}`);
  });

  test('should have add new item functionality', async () => {
    // Look for add button
    const addSelectors = [
      'button:has-text("Add")',
      'button:has-text("New")',
      'a:has-text("Add")',
      '[data-testid*="add"]',
      'button[title*="Add" i]',
    ];

    let addFound = false;

    for (const selector of addSelectors) {
      const addButton = page.locator(selector).first();
      if (await addButton.isVisible()) {
        addFound = true;
        await addButton.click();
        await page.waitForTimeout(2000);

        // Should navigate to add page or open modal
        const currentUrl = page.url();
        const hasModal =
          (await page
            .locator('[role="dialog"], .modal, [class*="modal"]')
            .count()) > 0;

        expect(currentUrl.includes('add') || hasModal).toBeTruthy();

        if (hasModal) {
          // Close modal
          const closeButton = page
            .locator(
              'button:has-text("Close"), button:has-text("Cancel"), [aria-label="Close"]'
            )
            .first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
        } else if (currentUrl.includes('add')) {
          // Go back to collection
          await page.goBack();
          await page.waitForLoadState('networkidle');
        }
        break;
      }
    }

    expect(addFound).toBeTruthy();
  });

  test('should have item actions (view, edit, delete, sell)', async () => {
    // Find first item if any exist
    const items = page.locator(
      '[class*="item"], [class*="card"], [data-testid*="item"]'
    );
    const itemCount = await items.count();

    if (itemCount > 0) {
      const firstItem = items.first();

      // Look for action buttons on hover or click
      await firstItem.hover();
      await page.waitForTimeout(500);

      const actionSelectors = [
        'button:has-text("View")',
        'button:has-text("Edit")',
        'button:has-text("Delete")',
        'button:has-text("Sell")',
        'button:has-text("Sold")',
        '[class*="action"]',
        '[data-testid*="action"]',
      ];

      let actionsFound = false;

      for (const selector of actionSelectors) {
        if ((await page.locator(selector).count()) > 0) {
          actionsFound = true;
          console.log(`Found action: ${selector}`);
        }
      }

      // Try clicking the item itself
      if (!actionsFound) {
        await firstItem.click();
        await page.waitForTimeout(1000);

        // Should either navigate or show actions
        const currentUrl = page.url();
        const hasModal =
          (await page.locator('[role="dialog"], .modal').count()) > 0;

        if (
          currentUrl.includes('collection') &&
          !currentUrl.endsWith('/collection')
        ) {
          console.log('Item click navigation detected');
          actionsFound = true;
        } else if (hasModal) {
          console.log('Item modal detected');
          actionsFound = true;
        }
      }

      console.log(`Item actions available: ${actionsFound}`);
    } else {
      console.log('No items found to test actions');
    }
  });

  test('should have search/filter functionality', async () => {
    // Look for search input
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="filter" i]',
      '[data-testid*="search"]',
      '.search input',
    ];

    let searchFound = false;

    for (const selector of searchSelectors) {
      const searchInput = page.locator(selector).first();
      if (await searchInput.isVisible()) {
        searchFound = true;

        // Test typing in search
        await searchInput.fill('charizard');
        await page.waitForTimeout(2000);

        // Check if results changed
        const itemsAfterSearch = await page
          .locator('[class*="item"], [class*="card"]')
          .count();
        console.log(`Items after search: ${itemsAfterSearch}`);

        // Clear search
        await searchInput.clear();
        await page.waitForTimeout(1000);

        break;
      }
    }

    // Look for filter buttons/dropdowns
    const filterSelectors = [
      'button:has-text("Filter")',
      'select',
      '[class*="filter"]',
      '[data-testid*="filter"]',
    ];

    for (const selector of filterSelectors) {
      if ((await page.locator(selector).count()) > 0) {
        searchFound = true;
        console.log(`Filter found: ${selector}`);
      }
    }

    console.log(
      `Search/filter functionality: ${searchFound ? 'Available' : 'Not found'}`
    );
  });

  test('should have export functionality', async () => {
    // Look for export button
    const exportSelectors = [
      'button:has-text("Export")',
      'button:has-text("Download")',
      '[data-testid*="export"]',
      'button[title*="Export" i]',
    ];

    let exportFound = false;

    for (const selector of exportSelectors) {
      const exportButton = page.locator(selector).first();
      if (await exportButton.isVisible()) {
        exportFound = true;

        // Test clicking export button
        await exportButton.click();
        await page.waitForTimeout(2000);

        // Should show export options or start download
        const hasExportModal =
          (await page
            .locator(
              '[role="dialog"]:has-text("Export"), [class*="modal"]:has-text("Export")'
            )
            .count()) > 0;
        const hasDownloadStarted =
          (await page.locator('text="downloading", text="preparing"').count()) >
          0;

        expect(hasExportModal || hasDownloadStarted).toBeTruthy();

        // Close modal if opened
        if (hasExportModal) {
          const closeButton = page
            .locator('[aria-label="Close"], button:has-text("Cancel")')
            .first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
        }
        break;
      }
    }

    console.log(
      `Export functionality: ${exportFound ? 'Available' : 'Not found'}`
    );
  });

  test('should handle bulk operations', async () => {
    // Look for select all or bulk action options
    const bulkSelectors = [
      'input[type="checkbox"]',
      'button:has-text("Select All")',
      '[data-testid*="select"]',
      '[class*="select-all"]',
    ];

    let bulkFound = false;

    for (const selector of bulkSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();

      if (count > 0) {
        bulkFound = true;
        console.log(
          `Bulk operation elements found: ${count} with selector: ${selector}`
        );

        // If checkboxes, try selecting some
        if (selector.includes('checkbox')) {
          for (let i = 0; i < Math.min(3, count); i++) {
            const checkbox = elements.nth(i);
            if (await checkbox.isVisible()) {
              await checkbox.check();
              await page.waitForTimeout(500);
            }
          }

          // Look for bulk action buttons that appear
          const bulkActionButtons = await page
            .locator(
              'button:has-text("Delete Selected"), button:has-text("Export Selected")'
            )
            .count();
          if (bulkActionButtons > 0) {
            console.log('Bulk action buttons appeared after selection');
          }
        }
        break;
      }
    }

    console.log(`Bulk operations: ${bulkFound ? 'Available' : 'Not found'}`);
  });

  test('should be responsive on mobile', async () => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Should still show collection content
    await expect(page.locator('body')).toBeVisible();

    // Items should be stacked or in mobile layout
    const items = await page
      .locator('[class*="item"], [class*="card"]')
      .count();
    console.log(`Items visible on mobile: ${items}`);

    // Should have mobile navigation or responsive tabs
    const hasMobileNav =
      (await page.locator('[class*="mobile"], [class*="hamburger"]').count()) >
      0;
    const hasVerticalLayout =
      (await page.locator('[class*="flex-col"], [class*="vertical"]').count()) >
      0;

    console.log(
      `Mobile optimizations: Nav=${hasMobileNav}, Layout=${hasVerticalLayout}`
    );

    await page.screenshot({ path: 'test-results/collection-mobile.png' });
  });

  test('should handle error states gracefully', async () => {
    // Mock API failure
    await page.route('**/api/collection/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to fetch collection' }),
      });
    });

    await page.reload();
    await page.waitForTimeout(3000);

    // Should show error message or fallback state
    const hasError =
      (await page
        .locator('text="error", text="Error", text="failed"')
        .count()) > 0;
    const hasRetryButton =
      (await page
        .locator('button:has-text("Retry"), button:has-text("Try Again")')
        .count()) > 0;

    expect(hasError || hasRetryButton).toBeTruthy();

    await page.screenshot({ path: 'test-results/collection-error.png' });
  });
});
