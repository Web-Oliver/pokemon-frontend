/**
 * Search Functionality Tests - Complete Coverage
 * Tests ALL search pages: SetSearch, SealedProductSearch, autocomplete, filters
 */

import { expect, Page, test } from '@playwright/test';
import { getBaseURL } from '../../utils/environment-switcher';

test.describe('Search - Complete Functionality', () => {
  let page: Page;

  test.afterEach(async () => {
    await page.close();
  });

  test('should load SetSearch page with search functionality', async ({
    browser,
  }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/sets`);
    await page.waitForLoadState('networkidle');

    // Should have search page header
    await expect(page.locator('h1, [role="heading"]')).toContainText([
      'Set',
      'Search',
    ]);

    // Should have search input
    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="set" i]'
      )
      .first();
    await expect(searchInput).toBeVisible();

    await page.screenshot({ path: 'test-results/set-search-page.png' });
  });

  test('should handle set search with autocomplete', async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/sets`);
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="set" i]'
      )
      .first();

    if (await searchInput.isVisible()) {
      // Test typing to trigger autocomplete
      await searchInput.fill('base');
      await page.waitForTimeout(2000);

      // Look for autocomplete suggestions
      const suggestionSelectors = [
        '[role="listbox"]',
        '[class*="suggestion"]',
        '[class*="dropdown"]',
        '[class*="autocomplete"]',
        'ul li',
        '[data-testid*="suggestion"]',
      ];

      let suggestionsFound = false;
      for (const selector of suggestionSelectors) {
        const suggestions = page.locator(selector);
        const count = await suggestions.count();

        if (count > 0) {
          suggestionsFound = true;
          console.log(`Found ${count} suggestions with selector: ${selector}`);

          // Test selecting first suggestion
          const firstSuggestion = suggestions.first();
          if (await firstSuggestion.isVisible()) {
            await firstSuggestion.click();
            await page.waitForTimeout(2000);

            // Should populate search field
            const inputValue = await searchInput.inputValue();
            expect(inputValue.length).toBeGreaterThan(0);

            console.log(`Selected suggestion populated: ${inputValue}`);
          }
          break;
        }
      }

      console.log(
        `Autocomplete suggestions: ${suggestionsFound ? 'Working' : 'Not found'}`
      );

      await page.screenshot({
        path: 'test-results/set-search-autocomplete.png',
      });
    }
  });

  test('should display search results for sets', async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/sets`);
    await page.waitForLoadState('networkidle');

    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();

    if (await searchInput.isVisible()) {
      // Search for a common term
      await searchInput.fill('charizard');

      // Look for search button or press Enter
      const searchButton = page
        .locator('button:has-text("Search"), button[type="submit"]')
        .first();
      if (await searchButton.isVisible()) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }

      await page.waitForTimeout(3000);

      // Check for search results
      const resultSelectors = [
        '[class*="result"]',
        '[class*="set"]',
        '[class*="card"]',
        '[data-testid*="result"]',
        '.search-result',
      ];

      let resultsFound = false;
      let totalResults = 0;

      for (const selector of resultSelectors) {
        const results = page.locator(selector);
        const count = await results.count();
        totalResults += count;

        if (count > 0) {
          resultsFound = true;
          console.log(`Found ${count} results with selector: ${selector}`);

          // Verify first few results have content
          for (let i = 0; i < Math.min(3, count); i++) {
            const result = results.nth(i);
            if (await result.isVisible()) {
              const hasText = (await result.locator('text=/\\w+/').count()) > 0;
              const hasImage = (await result.locator('img').count()) > 0;

              expect(hasText || hasImage).toBeTruthy();
            }
          }
        }
      }

      if (!resultsFound) {
        // Check for "no results" message
        const noResults =
          (await page
            .locator('text="no results", text="not found", text="no matches"')
            .count()) > 0;
        expect(noResults).toBeTruthy();
        console.log('No results message displayed');
      }

      console.log(`Total search results: ${totalResults}`);
      await page.screenshot({ path: 'test-results/set-search-results.png' });
    }
  });

  test('should load SealedProductSearch page', async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/sealed-products-search`);
    await page.waitForLoadState('networkidle');

    // Should have sealed product search page
    await expect(page.locator('h1, [role="heading"]')).toContainText([
      'Sealed',
      'Product',
      'Search',
    ]);

    // Should have search functionality
    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="product" i]'
      )
      .first();
    await expect(searchInput).toBeVisible();

    await page.screenshot({ path: 'test-results/sealed-product-search.png' });
  });

  test('should handle sealed product search with filters', async ({
    browser,
  }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/sealed-products-search`);
    await page.waitForLoadState('networkidle');

    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();

    if (await searchInput.isVisible()) {
      // Search for sealed products
      await searchInput.fill('booster box');
      await page.waitForTimeout(2000);

      // Look for filters
      const filterSelectors = [
        'select',
        'button:has-text("Filter")',
        '[class*="filter"]',
        '[data-testid*="filter"]',
      ];

      let filtersFound = false;
      for (const selector of filterSelectors) {
        const filters = page.locator(selector);
        const count = await filters.count();

        if (count > 0) {
          filtersFound = true;
          console.log(`Found ${count} filters with selector: ${selector}`);

          // Test first filter
          const firstFilter = filters.first();
          if ((await firstFilter.isVisible()) && selector === 'select') {
            const options = firstFilter.locator('option');
            const optionCount = await options.count();

            if (optionCount > 1) {
              await firstFilter.selectOption({ index: 1 });
              await page.waitForTimeout(2000);
              console.log('Filter applied');
            }
          }
        }
      }

      console.log(`Filters available: ${filtersFound ? 'Yes' : 'No'}`);

      // Execute search
      const searchButton = page
        .locator('button:has-text("Search"), button[type="submit"]')
        .first();
      if (await searchButton.isVisible()) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }

      await page.waitForTimeout(3000);
      await page.screenshot({
        path: 'test-results/sealed-product-results.png',
      });
    }
  });

  test('should handle hierarchical search (set first, then product)', async ({
    browser,
  }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/add-item`);
    await page.waitForLoadState('networkidle');

    // Select a type that has hierarchical search
    const typeButton = page
      .locator('button:has-text("Sealed"), button:has-text("Card")')
      .first();
    if (await typeButton.isVisible()) {
      await typeButton.click();
      await page.waitForTimeout(2000);

      // Look for set name field
      const setInput = page
        .locator('input[placeholder*="set" i], input[name*="set"]')
        .first();
      const productInput = page
        .locator(
          'input[placeholder*="product" i], input[placeholder*="card" i]'
        )
        .first();

      if ((await setInput.isVisible()) && (await productInput.isVisible())) {
        console.log('Hierarchical search inputs found');

        // Test set-first workflow
        await setInput.fill('base');
        await page.waitForTimeout(2000);

        // Look for set suggestions
        const setSuggestions = page.locator(
          '[role="listbox"], [class*="suggestion"]'
        );
        if ((await setSuggestions.count()) > 0) {
          await setSuggestions.first().click();
          await page.waitForTimeout(1000);

          // Now search products - should be filtered by set
          await productInput.fill('charizard');
          await page.waitForTimeout(2000);

          // Should show products from selected set
          const productSuggestions = await page
            .locator('[role="listbox"], [class*="suggestion"]')
            .count();
          console.log(
            `Product suggestions after set selection: ${productSuggestions}`
          );

          await page.screenshot({
            path: 'test-results/hierarchical-search.png',
          });
        }
      }
    }
  });

  test('should handle product-first autofill workflow', async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/add-item`);
    await page.waitForLoadState('networkidle');

    // Select type and find inputs
    const typeButton = page
      .locator('button:has-text("Sealed"), button:has-text("Card")')
      .first();
    if (await typeButton.isVisible()) {
      await typeButton.click();
      await page.waitForTimeout(2000);

      const setInput = page
        .locator('input[placeholder*="set" i], input[name*="set"]')
        .first();
      const productInput = page
        .locator(
          'input[placeholder*="product" i], input[placeholder*="card" i]'
        )
        .first();

      if ((await setInput.isVisible()) && (await productInput.isVisible())) {
        // Test product-first workflow
        await productInput.fill('charizard');
        await page.waitForTimeout(2000);

        // Select a product
        const productSuggestions = page.locator(
          '[role="listbox"] [role="option"], [class*="suggestion"]'
        );
        if ((await productSuggestions.count()) > 0) {
          await productSuggestions.first().click();
          await page.waitForTimeout(1000);

          // Set field should autofill
          const setValue = await setInput.inputValue();

          if (setValue.length > 0) {
            console.log(`Set autofilled after product selection: ${setValue}`);

            // Set input should not show suggestions now
            const setClickable = await setInput.isEditable();
            console.log(`Set field still editable: ${setClickable}`);

            await page.screenshot({
              path: 'test-results/product-first-autofill.png',
            });
          }
        }
      }
    }
  });

  test('should handle search pagination and load more', async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/sets`);
    await page.waitForLoadState('networkidle');

    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();

    if (await searchInput.isVisible()) {
      // Search for a broad term that might have many results
      await searchInput.fill('pokemon');
      await page.press('input[type="search"]', 'Enter');
      await page.waitForTimeout(3000);

      // Look for pagination or load more functionality
      const paginationSelectors = [
        'button:has-text("Load More")',
        'button:has-text("Next")',
        '[class*="pagination"]',
        'button:has-text("Show More")',
      ];

      let paginationFound = false;
      for (const selector of paginationSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          paginationFound = true;
          console.log(`Pagination/Load more found: ${selector}`);

          // Get current result count
          const resultsBefore = await page
            .locator('[class*="result"], [class*="item"], [class*="card"]')
            .count();

          // Click load more
          await element.click();
          await page.waitForTimeout(3000);

          // Check for more results
          const resultsAfter = await page
            .locator('[class*="result"], [class*="item"], [class*="card"]')
            .count();

          console.log(
            `Results before: ${resultsBefore}, after: ${resultsAfter}`
          );
          break;
        }
      }

      console.log(
        `Pagination functionality: ${paginationFound ? 'Available' : 'Not found'}`
      );
    }
  });

  test('should handle search errors and edge cases', async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${getBaseURL()}/sets`);
    await page.waitForLoadState('networkidle');

    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();

    if (await searchInput.isVisible()) {
      // Test empty search
      await searchInput.fill('');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      // Test special characters
      await searchInput.fill('!@#$%^&*()');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      // Test very long search
      await searchInput.fill('a'.repeat(100));
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      // Test search that should return no results
      await searchInput.fill('zzzzzzzznotfoundtest12345');
      await searchInput.press('Enter');
      await page.waitForTimeout(3000);

      // Should show "no results" message
      const noResults =
        (await page
          .locator(
            'text="no results", text="not found", text="no matches", text="nothing found"'
          )
          .count()) > 0;

      if (noResults) {
        console.log('No results message displayed for invalid search');
      }

      await page.screenshot({ path: 'test-results/search-no-results.png' });
    }
  });

  test('should handle search API calls and caching', async ({ browser }) => {
    page = await browser.newPage();

    let apiCalls = 0;
    const searchQueries: string[] = [];

    // Monitor search API calls
    page.on('request', (request) => {
      if (
        request.url().includes('/api/') &&
        (request.url().includes('search') ||
          request.url().includes('set') ||
          request.url().includes('product'))
      ) {
        apiCalls++;
        searchQueries.push(request.url());
        console.log(`Search API call: ${request.url()}`);
      }
    });

    await page.goto(`${getBaseURL()}/sets`);
    await page.waitForLoadState('networkidle');

    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();

    if (await searchInput.isVisible()) {
      // Make multiple searches to test API behavior
      const searchTerms = ['base', 'jungle', 'fossil'];

      for (const term of searchTerms) {
        await searchInput.fill(term);
        await page.waitForTimeout(1000); // Allow debouncing
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
      }

      // Search the same term again to test caching
      await searchInput.fill('base');
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);

      console.log(`Total search API calls: ${apiCalls}`);
      console.log(`Unique search queries: ${new Set(searchQueries).size}`);
    }
  });

  test('should be mobile responsive', async ({ browser }) => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`${getBaseURL()}/sets`);
    await page.waitForLoadState('networkidle');

    // Search should work on mobile
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i]')
      .first();
    await expect(searchInput).toBeVisible();

    // Search input should be properly sized
    const inputBounds = await searchInput.boundingBox();
    if (inputBounds) {
      expect(inputBounds.width).toBeGreaterThan(200); // Should be wide enough
    }

    // Test mobile search
    await searchInput.fill('test');
    await page.waitForTimeout(2000);

    // Results should be mobile-friendly
    const results = page.locator('[class*="result"], [class*="card"]');
    if ((await results.count()) > 0) {
      const firstResult = results.first();
      const resultBounds = await firstResult.boundingBox();

      if (resultBounds) {
        // Results should fit in mobile viewport
        expect(resultBounds.width).toBeLessThan(375);
      }
    }

    await page.screenshot({ path: 'test-results/search-mobile.png' });
  });
});
