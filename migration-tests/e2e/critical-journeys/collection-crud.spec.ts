/**
 * Collection CRUD Operations - Critical Journey Test
 * Tests core collection management functionality across old/new frontend
 */

import { expect, Page, test } from '@playwright/test';
import {
  getBaseURL,
  getEnvironmentDescription,
} from '../../utils/environment-switcher';
import {
  generateTestId,
  TestDataFactory,
  TestTiming,
} from '../../utils/test-data-factory';

test.describe(`Collection CRUD Operations - ${getEnvironmentDescription()}`, () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/collection`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display collection dashboard', async () => {
    // Verify main collection page elements
    await expect(
      page.locator('[data-testid="collection-header"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="add-item-button"]')).toBeVisible();

    // Check for collection stats or items
    const hasItems =
      (await page.locator('[data-testid="collection-item"]').count()) > 0;
    const hasEmptyState = await page
      .locator('[data-testid="empty-collection"]')
      .isVisible();

    // Either items or empty state should be visible
    expect(hasItems || hasEmptyState).toBeTruthy();
  });

  test('should add new PSA graded card', async () => {
    const testCard = TestDataFactory.createTestPsaCard({
      cardName: `Test_Charizard_${generateTestId()}`,
      setName: 'Base Set',
      grade: 10,
    });

    // Start adding new item
    await page.click('[data-testid="add-item-button"]');

    // Select PSA Graded Card option
    await page.click('[data-testid="add-psa-card"]');

    // Fill out form
    await page.fill('[data-testid="card-name-input"]', testCard.cardName);
    await page.fill('[data-testid="set-name-input"]', testCard.setName);
    await page.selectOption(
      '[data-testid="grade-select"]',
      testCard.grade.toString()
    );
    await page.fill('[data-testid="price-input"]', testCard.price.toString());

    // Submit form
    await page.click('[data-testid="submit-card-button"]');

    // Wait for success and verify redirect
    await page.waitForURL('**/collection', { timeout: TestTiming.API_TIMEOUT });

    // Verify card appears in collection
    await expect(page.locator(`text="${testCard.cardName}"`)).toBeVisible();
    await expect(page.locator(`text="Grade ${testCard.grade}"`)).toBeVisible();
  });

  test('should add new raw card', async () => {
    const testCard = TestDataFactory.createTestRawCard({
      cardName: `Test_Pikachu_${generateTestId()}`,
      setName: 'Base Set',
      condition: 'Near Mint',
    });

    await page.click('[data-testid="add-item-button"]');
    await page.click('[data-testid="add-raw-card"]');

    await page.fill('[data-testid="card-name-input"]', testCard.cardName);
    await page.fill('[data-testid="set-name-input"]', testCard.setName);
    await page.selectOption(
      '[data-testid="condition-select"]',
      testCard.condition
    );
    await page.fill('[data-testid="price-input"]', testCard.price.toString());

    await page.click('[data-testid="submit-card-button"]');
    await page.waitForURL('**/collection', { timeout: TestTiming.API_TIMEOUT });

    await expect(page.locator(`text="${testCard.cardName}"`)).toBeVisible();
    await expect(page.locator(`text="${testCard.condition}"`)).toBeVisible();
  });

  test('should add sealed product', async () => {
    const testProduct = TestDataFactory.createTestSealedProduct({
      productName: `Test_Booster_Box_${generateTestId()}`,
      setName: 'Base Set',
    });

    await page.click('[data-testid="add-item-button"]');
    await page.click('[data-testid="add-sealed-product"]');

    await page.fill(
      '[data-testid="product-name-input"]',
      testProduct.productName
    );
    await page.fill('[data-testid="set-name-input"]', testProduct.setName);
    await page.selectOption(
      '[data-testid="category-select"]',
      testProduct.category
    );
    await page.fill(
      '[data-testid="price-input"]',
      testProduct.price.toString()
    );

    await page.click('[data-testid="submit-product-button"]');
    await page.waitForURL('**/collection', { timeout: TestTiming.API_TIMEOUT });

    await expect(
      page.locator(`text="${testProduct.productName}"`)
    ).toBeVisible();
    await expect(page.locator(`text="${testProduct.category}"`)).toBeVisible();
  });

  test('should edit existing item', async () => {
    // Assume we have at least one item in collection
    const firstItem = page.locator('[data-testid="collection-item"]').first();
    await expect(firstItem).toBeVisible();

    // Click edit button on first item
    await firstItem.locator('[data-testid="edit-item-button"]').click();

    // Update price field
    const newPrice = '999.99';
    await page.fill('[data-testid="price-input"]', newPrice);

    // Save changes
    await page.click('[data-testid="submit-button"]');
    await page.waitForURL('**/collection', { timeout: TestTiming.API_TIMEOUT });

    // Verify updated price appears
    await expect(page.locator(`text="$${newPrice}"`)).toBeVisible();
  });

  test('should delete item with confirmation', async () => {
    // Get initial count of items
    const initialCount = await page
      .locator('[data-testid="collection-item"]')
      .count();

    if (initialCount === 0) {
      // Skip test if no items to delete
      test.skip();
    }

    // Find first item and get its name for verification
    const firstItem = page.locator('[data-testid="collection-item"]').first();
    const itemName = await firstItem
      .locator('[data-testid="item-name"]')
      .textContent();

    // Click delete button
    await firstItem.locator('[data-testid="delete-item-button"]').click();

    // Confirm deletion in modal
    await expect(
      page.locator('[data-testid="confirm-delete-modal"]')
    ).toBeVisible();
    await expect(page.locator(`text="${itemName}"`)).toBeVisible(); // Item name in confirmation

    await page.click('[data-testid="confirm-delete-button"]');

    // Wait for deletion to complete
    await page.waitForTimeout(TestTiming.SHORT_WAIT);

    // Verify item count decreased
    const finalCount = await page
      .locator('[data-testid="collection-item"]')
      .count();
    expect(finalCount).toBe(initialCount - 1);

    // Verify item name no longer appears (unless there are duplicates)
    const remainingItemsWithSameName = await page
      .locator(`text="${itemName}"`)
      .count();
    expect(remainingItemsWithSameName).toBeLessThan(initialCount);
  });

  test('should handle form validation errors', async () => {
    await page.click('[data-testid="add-item-button"]');
    await page.click('[data-testid="add-psa-card"]');

    // Try to submit empty form
    await page.click('[data-testid="submit-card-button"]');

    // Verify validation errors appear
    await expect(page.locator('[data-testid="form-error"]')).toBeVisible();
    await expect(page.locator('text="required"')).toBeVisible();

    // Form should not submit (still on same page)
    await expect(page.locator('[data-testid="card-name-input"]')).toBeVisible();
  });

  test('should navigate between collection views', async () => {
    // Test different collection view modes if they exist
    const listViewButton = page.locator('[data-testid="list-view-button"]');
    const gridViewButton = page.locator('[data-testid="grid-view-button"]');

    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      await page.waitForTimeout(TestTiming.SHORT_WAIT);
      await expect(
        page.locator('[data-testid="collection-list-view"]')
      ).toBeVisible();
    }

    if (await gridViewButton.isVisible()) {
      await gridViewButton.click();
      await page.waitForTimeout(TestTiming.SHORT_WAIT);
      await expect(
        page.locator('[data-testid="collection-grid-view"]')
      ).toBeVisible();
    }
  });
});
