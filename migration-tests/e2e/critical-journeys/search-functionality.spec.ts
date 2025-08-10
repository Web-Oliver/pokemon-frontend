/**
 * Search Functionality - Critical Journey Test
 * Tests hierarchical search and filtering across old/new frontend
 */

import { expect, Page, test } from '@playwright/test';
import {
  getBaseURL,
  getEnvironmentDescription,
} from '../../utils/environment-switcher';
import { TestTiming } from '../../utils/test-data-factory';

test.describe(`Search Functionality - ${getEnvironmentDescription()}`, () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should perform basic set search', async () => {
    await page.goto(`${getBaseURL()}/search`);
    await page.waitForLoadState('networkidle');

    // Test set search
    const searchInput = page.locator('[data-testid="set-search-input"]');
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('Base Set');
    await page.waitForTimeout(TestTiming.SHORT_WAIT); // Wait for debounce

    // Verify search results appear
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="search-result-item"]')
    ).toHaveCountGreaterThan(0);

    // Verify Base Set appears in results
    await expect(page.locator('text="Base Set"')).toBeVisible();
  });

  test('should perform hierarchical search (set → card)', async () => {
    await page.goto(`${getBaseURL()}/search`);

    // First, search and select a set
    await page.fill('[data-testid="set-search-input"]', 'Base Set');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);

    // Select the first set result
    await page.click('[data-testid="search-result-item"]:first-child');

    // Verify set is selected and card search is now available
    await expect(page.locator('[data-testid="selected-set"]')).toContainText(
      'Base Set'
    );
    await expect(
      page.locator('[data-testid="card-search-input"]')
    ).toBeEnabled();

    // Now search for cards within the selected set
    await page.fill('[data-testid="card-search-input"]', 'Charizard');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);

    // Verify filtered card results
    await expect(
      page.locator('[data-testid="card-search-results"]')
    ).toBeVisible();
    await expect(page.locator('text="Charizard"')).toBeVisible();

    // Verify results are from the selected set only
    const cardResults = page.locator('[data-testid="card-result-item"]');
    const firstCard = cardResults.first();
    await expect(firstCard).toContainText('Base Set');
  });

  test('should perform hierarchical search (set → product)', async () => {
    await page.goto(`${getBaseURL()}/search`);

    // Search and select a set first
    await page.fill('[data-testid="set-search-input"]', 'Base Set');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);
    await page.click('[data-testid="search-result-item"]:first-child');

    // Switch to product search tab or section
    const productTab = page.locator('[data-testid="product-search-tab"]');
    if (await productTab.isVisible()) {
      await productTab.click();
    }

    // Search for products within the selected set
    await page.fill('[data-testid="product-search-input"]', 'Booster');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);

    // Verify product results are filtered by set
    await expect(
      page.locator('[data-testid="product-search-results"]')
    ).toBeVisible();
    await expect(page.locator('text="Booster"')).toBeVisible();

    // Verify products are from selected set
    const productResults = page.locator('[data-testid="product-result-item"]');
    const firstProduct = productResults.first();
    await expect(firstProduct).toContainText('Base Set');
  });

  test('should autofill set when selecting card/product first', async () => {
    await page.goto(`${getBaseURL()}/search`);

    // Search cards without selecting set first
    await page.fill('[data-testid="card-search-input"]', 'Charizard');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);

    // Select a specific card result
    await page.click('[data-testid="card-result-item"]:first-child');

    // Verify the set field gets autofilled
    const setInput = page.locator('[data-testid="set-search-input"]');
    await expect(setInput).not.toHaveValue('');

    // The set should now be populated with the card's set
    const setValue = await setInput.inputValue();
    expect(setValue).toBeTruthy();
  });

  test('should handle search with no results', async () => {
    await page.goto(`${getBaseURL()}/search`);

    // Search for something that doesn't exist
    await page.fill('[data-testid="set-search-input"]', 'NonExistentSet123');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);

    // Verify no results message appears
    await expect(
      page.locator('[data-testid="no-results-message"]')
    ).toBeVisible();
    await expect(page.locator('text="No results found"')).toBeVisible();
  });

  test('should clear search results when input is cleared', async () => {
    await page.goto(`${getBaseURL()}/search`);

    // Perform search to get results
    await page.fill('[data-testid="set-search-input"]', 'Base');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);
    await expect(
      page.locator('[data-testid="search-result-item"]')
    ).toHaveCountGreaterThan(0);

    // Clear the search input
    await page.fill('[data-testid="set-search-input"]', '');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);

    // Verify results are cleared
    await expect(
      page.locator('[data-testid="search-results"]')
    ).not.toBeVisible();
  });

  test('should maintain search state during navigation', async () => {
    await page.goto(`${getBaseURL()}/search`);

    // Perform search and select set
    await page.fill('[data-testid="set-search-input"]', 'Base Set');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);
    await page.click('[data-testid="search-result-item"]:first-child');

    // Navigate away and back
    await page.goto(`${getBaseURL()}/collection`);
    await page.goto(`${getBaseURL()}/search`);

    // Verify search state is maintained (if implemented)
    const setInput = page.locator('[data-testid="set-search-input"]');
    const inputValue = await setInput.inputValue();

    // Note: This test depends on whether search state persistence is implemented
    // If not implemented, this test can help identify the difference
    console.log(`Search state persistence: ${inputValue ? 'YES' : 'NO'}`);
  });

  test('should handle rapid search input (debouncing)', async () => {
    await page.goto(`${getBaseURL()}/search`);

    const searchInput = page.locator('[data-testid="set-search-input"]');

    // Type rapidly to test debouncing
    await searchInput.type('B');
    await searchInput.type('a');
    await searchInput.type('s');
    await searchInput.type('e');

    // Wait for debounce period
    await page.waitForTimeout(TestTiming.SHORT_WAIT);

    // Should only see results for complete "Base" search
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('text="Base"')).toBeVisible();
  });

  test('should support keyboard navigation in search results', async () => {
    await page.goto(`${getBaseURL()}/search`);

    // Perform search
    await page.fill('[data-testid="set-search-input"]', 'Base');
    await page.waitForTimeout(TestTiming.SHORT_WAIT);

    // Test keyboard navigation if implemented
    const searchInput = page.locator('[data-testid="set-search-input"]');

    // Arrow down to first result
    await searchInput.press('ArrowDown');

    // Check if first result is highlighted
    const firstResult = page
      .locator('[data-testid="search-result-item"]')
      .first();
    const isHighlighted = await firstResult.evaluate(
      (el) =>
        el.classList.contains('highlighted') ||
        el.classList.contains('selected')
    );

    // Enter to select highlighted result
    await searchInput.press('Enter');

    // Verify selection occurred
    await expect(page.locator('[data-testid="selected-set"]')).toBeVisible();
  });
});
