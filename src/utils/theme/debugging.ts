/**
 * Theme Debugging Utilities
 * Split from themeDebug.ts for better maintainability
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Debug utilities only
 * - DRY: Centralized debug logic
 */

import { VisualTheme, ThemeConfiguration, ComponentStyleConfig } from '../../types/themeTypes';
import { validateThemeConfiguration } from './validation';
import { getThemePerformanceMetrics } from './performance';

/**
 * Extract theme properties from DOM
 */
export function extractThemeProperties(): Record<string, string> {
  const properties: Record<string, string> = {};
  
  if (typeof window === 'undefined') {
    return properties;
  }

  const computedStyles = getComputedStyle(document.documentElement);
  
  // Extract CSS custom properties that contain 'theme'
  for (let i = 0; i < computedStyles.length; i++) {
    const property = computedStyles[i];
    if (property.startsWith('--theme') || property.startsWith('--glass')) {
      properties[property] = computedStyles.getPropertyValue(property).trim();
    }
  }
  
  return properties;
}

/**
 * Log current theme state to console with formatted output
 */
export function logThemeState(config: ThemeConfiguration): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🎨 Theme Debug Information');
    console.log('Current Configuration:', config);
    console.log('CSS Properties:', extractThemeProperties());
    console.log('Performance Metrics:', getThemePerformanceMetrics());
    console.log('Validation Results:', validateThemeConfiguration(config));
    console.groupEnd();
  }
}

/**
 * Create debug utilities for theme testing
 */
export function createThemeDebugger() {
  return {
    testAllVariants: (
      componentName: string,
      styleConfig: ComponentStyleConfig
    ) => {
      const variants = Object.keys(styleConfig.variants || {});
      const sizes = Object.keys(styleConfig.sizes || {});

      if (process.env.NODE_ENV === 'development') {
        console.group(`🧪 Testing ${componentName} variants`);
        variants.forEach((variant) => {
          sizes.forEach((size) => {
            console.log(`${variant} + ${size}:`, {
              classes: [
                styleConfig.base,
                styleConfig.variants?.[variant],
                styleConfig.sizes?.[size],
              ]
                .filter(Boolean)
                .join(' '),
            });
          });
        });
        console.groupEnd();
      }
    },

    validateAllComponents: () => {
      const components = ['button', 'input', 'card', 'badge'];
      components.forEach((component) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Validating ${component} component...`);
        }
        // Component validation logic would go here
      });
    },
  };
}

/**
 * Generate theme comparison report
 */
export function generateThemeComparison(
  themes: VisualTheme[]
): Record<string, any> {
  const comparison: Record<string, any> = {};
  
  themes.forEach(theme => {
    comparison[theme] = {
      name: theme,
      // Add comparison metrics here
      properties: extractThemeProperties(),
      timestamp: new Date().toISOString(),
    };
  });
  
  return comparison;
}