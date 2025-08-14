import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  // Hook to run before each story test
  async preVisit(page, context) {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Set theme data attribute for consistent theming
    const theme = context.parameters?.theme || 'pokemon';
    const mode = context.parameters?.mode || 'light';
    const density = context.parameters?.density || 'comfortable';
    
    await page.evaluate(({ theme, mode, density }) => {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-mode', mode);
      document.documentElement.setAttribute('data-density', density);
    }, { theme, mode, density });

    // Wait for theme to apply
    await page.waitForTimeout(100);
  },

  // Hook to run after each story test
  async postVisit(page, context) {
    // Take screenshot for visual regression testing
    const storyId = context.id;
    const screenshotPath = `screenshots/${storyId}.png`;
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      animations: 'disabled'
    });

    // Check for accessibility violations
    const accessibilityAudit = await page.evaluate(async () => {
      // @ts-ignore
      if (typeof window.axe !== 'undefined') {
        // @ts-ignore
        return await window.axe.run();
      }
      return null;
    });

    if (accessibilityAudit && accessibilityAudit.violations.length > 0) {
      console.warn(`Accessibility violations found in ${storyId}:`, accessibilityAudit.violations);
    }
  },

  // Custom tags for test organization
  tags: {
    include: ['test'],
    exclude: ['skip-test'],
  },

  // Jest configuration for test runner
  jest: {
    testTimeout: 60000,
    setupFilesAfterEnv: ['<rootDir>/.storybook/test-setup.ts'],
  }
};

export default config;