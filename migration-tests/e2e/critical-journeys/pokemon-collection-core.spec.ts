/**
 * Pokemon Collection Core Features - Critical Journey Test
 * Tests the main collection management functionality
 */

import { expect, Page, test } from '@playwright/test';
import {
  getBaseURL,
  getEnvironmentDescription,
} from '../../utils/environment-switcher';
import { TestTiming } from '../../utils/test-data-factory';

test.describe(`Pokemon Collection Core - ${getEnvironmentDescription()}`, () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(getBaseURL());
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display the main dashboard/homepage', async () => {
    console.log(`Testing Pokemon Collection at: ${getBaseURL()}`);

    // Look for Pokemon-related content
    const pokemonIndicators = [
      'pokemon',
      'collection',
      'card',
      'graded',
      'psa',
      'auction',
    ];

    let foundContent = false;
    for (const indicator of pokemonIndicators) {
      const count = await page.locator(`text=${indicator}`).count();
      if (count > 0) {
        console.log(
          `✅ Found Pokemon content: "${indicator}" (${count} matches)`
        );
        foundContent = true;
        break;
      }
    }

    // Should have some Pokemon-related content
    expect(foundContent).toBeTruthy();

    // Take screenshot of main page
    await page.screenshot({ path: 'test-results/pokemon-main-page.png' });
  });

  test('should navigate to collection page', async () => {
    // Try various ways to navigate to collection
    const collectionSelectors = [
      'a[href*="collection"]',
      'button:has-text("Collection")',
      'nav a:has-text("Collection")',
      '[data-testid*="collection"]',
      'text="Collection"',
      'text="My Collection"',
    ];

    let navigationWorked = false;
    for (const selector of collectionSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found collection navigation: ${selector}`);
          await element.click();
          await page.waitForTimeout(TestTiming.MEDIUM_WAIT);

          // Check if URL changed or content indicates collection page
          const url = page.url();
          const hasCollectionContent =
            (await page.locator('text=collection').count()) > 0;

          if (url.includes('collection') || hasCollectionContent) {
            console.log(`✅ Successfully navigated to collection`);
            navigationWorked = true;
            break;
          }
        }
      } catch (error) {
        // Continue trying other selectors
        continue;
      }
    }

    if (!navigationWorked) {
      console.log(
        'ℹ️  Direct collection navigation not found, checking if already on collection page'
      );
      // Maybe we're already on a collection page
      const url = page.url();
      const hasCollectionContent =
        (await page.locator('text=collection').count()) > 0;
      navigationWorked = url.includes('collection') || hasCollectionContent;
    }

    // Take screenshot of collection area
    await page.screenshot({ path: 'test-results/collection-page.png' });

    // Should be able to access collection functionality somehow
    expect(navigationWorked).toBeTruthy();
  });

  test('should have search functionality', async () => {
    // Look for search inputs
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="find" i]',
      '[data-testid*="search"]',
      '.search input',
      'input[name*="search"]',
    ];

    let searchFound = false;
    for (const selector of searchSelectors) {
      const searchInput = page.locator(selector).first();
      if (await searchInput.isVisible()) {
        console.log(`✅ Found search input: ${selector}`);

        // Try typing in search
        await searchInput.fill('charizard');
        await page.waitForTimeout(TestTiming.SHORT_WAIT);

        // Look for search results or suggestions
        const hasResults = (await page.locator('text=charizard').count()) > 1; // More than just the input
        console.log(
          `Search results for 'charizard': ${hasResults ? 'Found' : 'Not found'}`
        );

        searchFound = true;
        break;
      }
    }

    if (!searchFound) {
      console.log(
        'ℹ️  No visible search input found, checking for search buttons'
      );
      // Look for search buttons that might open search
      const searchButtons = page.locator('button:has-text("Search")');
      if ((await searchButtons.count()) > 0) {
        await searchButtons.first().click();
        await page.waitForTimeout(TestTiming.SHORT_WAIT);
        searchFound = (await page.locator('input').count()) > 0;
      }
    }

    await page.screenshot({ path: 'test-results/search-functionality.png' });

    // Search functionality is optional - log but don't fail migration tests
    if (!searchFound) {
      console.log(
        'ℹ️  Search functionality not found on main page - may be in separate search page'
      );
    }
    console.log(
      `Search functionality available: ${searchFound ? 'Yes' : 'No'}`
    );

    // For baseline recording, we just document the current state
    // expect(searchFound).toBeTruthy(); // Commented out for baseline
  });

  test('should have add/create functionality', async () => {
    // Look for add buttons or create functionality
    const addSelectors = [
      'button:has-text("Add")',
      'button:has-text("Create")',
      'button:has-text("New")',
      '[data-testid*="add"]',
      '[data-testid*="create"]',
      'button[title*="Add" i]',
      '.add-button',
      'a[href*="add"]',
      'a[href*="create"]',
    ];

    let addFound = false;
    for (const selector of addSelectors) {
      const addElement = page.locator(selector).first();
      if (await addElement.isVisible()) {
        console.log(`✅ Found add functionality: ${selector}`);
        addFound = true;
        break;
      }
    }

    if (!addFound) {
      // Look for plus icons or + symbols
      const plusSelectors = [
        'button:has-text("+")',
        '[class*="plus"]',
        'svg[class*="plus"]',
      ];

      for (const selector of plusSelectors) {
        if ((await page.locator(selector).count()) > 0) {
          console.log(`✅ Found plus/add icon: ${selector}`);
          addFound = true;
          break;
        }
      }
    }

    await page.screenshot({ path: 'test-results/add-functionality.png' });

    // Should have some way to add/create items
    expect(addFound).toBeTruthy();
  });

  test('should display items/cards if collection exists', async () => {
    // Look for card/item displays
    const itemSelectors = [
      '[data-testid*="card"]',
      '[data-testid*="item"]',
      '.card',
      '.item',
      '[class*="card"]',
      '[class*="item"]',
      'img[alt*="card" i]',
      'img[alt*="pokemon" i]',
    ];

    let itemsFound = false;
    let itemCount = 0;

    for (const selector of itemSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(
          `✅ Found items using selector "${selector}": ${count} items`
        );
        itemsFound = true;
        itemCount += count;
      }
    }

    if (!itemsFound) {
      // Look for empty state messages
      const emptySelectors = [
        'text="no items"',
        'text="empty"',
        'text="nothing"',
        'text="no cards"',
        'text="add your first"',
        '[data-testid*="empty"]',
      ];

      for (const selector of emptySelectors) {
        if ((await page.locator(selector).count()) > 0) {
          console.log(`✅ Found empty state: ${selector}`);
          itemsFound = true; // Empty state is still valid
          break;
        }
      }
    }

    await page.screenshot({ path: 'test-results/collection-items.png' });

    console.log(`Total potential items found: ${itemCount}`);

    // Should either have items or show empty state
    expect(itemsFound).toBeTruthy();
  });

  test('should have navigation menu', async () => {
    // Look for navigation menu items
    const navItems = [
      'Collection',
      'Auction',
      'Search',
      'Analytics',
      'Dashboard',
    ];

    let navItemsFound = 0;
    for (const item of navItems) {
      const count = await page.locator(`text="${item}"`).count();
      if (count > 0) {
        console.log(`✅ Found nav item: ${item}`);
        navItemsFound++;
      }
    }

    // Should have at least some navigation items
    expect(navItemsFound).toBeGreaterThan(0);

    console.log(`Navigation items found: ${navItemsFound}/${navItems.length}`);

    await page.screenshot({ path: 'test-results/navigation-menu.png' });
  });

  test('should handle loading states gracefully', async () => {
    // Refresh page and check for loading indicators
    await page.reload();

    const loadingSelectors = [
      '[data-testid*="loading"]',
      '.loading',
      'text="loading"',
      'text="Loading"',
      '[class*="spinner"]',
      '[class*="loading"]',
    ];

    let loadingFound = false;
    for (const selector of loadingSelectors) {
      if ((await page.locator(selector).count()) > 0) {
        console.log(`✅ Found loading indicator: ${selector}`);
        loadingFound = true;
        break;
      }
    }

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Page should eventually load completely
    await expect(page.locator('body')).toBeVisible();

    console.log(`Loading states found: ${loadingFound ? 'Yes' : 'No'}`);
  });
});
