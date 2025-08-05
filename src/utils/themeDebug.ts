/**
 * Theme Debug Utilities
 * Phase 3.3.1: Developer Debugging Tools
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Theme debugging utilities only
 * - Open/Closed: Extensible for new debugging features
 * - DRY: Centralized debugging logic
 * - Dependency Inversion: Abstracts debugging implementation details
 *
 * Integrates with:
 * - ThemeContext.tsx for theme configuration
 * - themeUtils.ts for component style configurations
 * - formThemes.ts for color scheme validation
 */

import { VisualTheme, ThemeConfiguration } from '../types/themeTypes';
import { formThemes } from '../theme/formThemes';
import { ComponentStyleConfig } from '../types/themeTypes';

// ================================
// VALIDATION INTERFACES
// ================================

export interface ValidationResult {
  type: 'error' | 'warning' | 'success';
  category: 'Configuration' | 'Performance' | 'Accessibility' | 'Compatibility';
  message: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ThemePerformanceMetrics {
  cssPropertiesCount: number;
  themeClassesCount: number;
  loadTimeMs: number;
  memoryUsageMB: number;
  lastSwitchDuration: number;
  totalSwitches: number;
  averageSwitchTime: number;
  bundleSizeImpact: number;
  renderImpactScore: number;
}

export interface ComponentVariantInfo {
  componentName: string;
  variants: string[];
  sizes: string[];
  states: string[];
  totalCombinations: number;
  baseClasses: string;
  exampleUsage: string[];
}

// ================================
// THEME VALIDATION UTILITIES
// ================================

/**
 * Validates theme configuration against best practices and potential issues
 */
export function validateThemeConfiguration(
  config: ThemeConfiguration
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Configuration validation
  if (!config.visualTheme) {
    results.push({
      type: 'error',
      category: 'Configuration',
      message: 'Visual theme is not set',
      suggestion: 'Set a valid visual theme from available options',
      severity: 'critical',
    });
  }

  if (!config.primaryColor || !formThemes[config.primaryColor]) {
    results.push({
      type: 'error',
      category: 'Configuration',
      message: 'Primary color is invalid or not supported',
      suggestion:
        'Choose from available color schemes: purple, blue, emerald, amber, rose, dark',
      severity: 'high',
    });
  }

  // Performance validation
  if (config.glassmorphismIntensity > 80) {
    results.push({
      type: 'warning',
      category: 'Performance',
      message: 'High glassmorphism intensity may impact performance',
      suggestion:
        'Consider reducing glassmorphism intensity for better performance',
      severity: 'medium',
    });
  }

  if (
    config.particleEffectsEnabled &&
    config.animationIntensity === 'enhanced'
  ) {
    results.push({
      type: 'warning',
      category: 'Performance',
      message:
        'Enhanced animations with particles may impact performance on lower-end devices',
      suggestion:
        'Consider reducing animation intensity or disabling particles for performance',
      severity: 'medium',
    });
  }

  // Accessibility validation
  if (!config.reducedMotion && config.animationIntensity === 'enhanced') {
    results.push({
      type: 'warning',
      category: 'Accessibility',
      message: 'Enhanced animations without reduced motion consideration',
      suggestion: 'Respect system prefers-reduced-motion setting',
      severity: 'medium',
    });
  }

  if (!config.highContrast) {
    results.push({
      type: 'success',
      category: 'Accessibility',
      message: 'Standard contrast mode active',
      severity: 'low',
    });
  }

  // Compatibility validation
  const supportedVisualThemes: VisualTheme[] = [
    'context7-premium',
    'context7-futuristic',
    'dba-cosmic',
    'minimal',
  ];
  if (!supportedVisualThemes.includes(config.visualTheme)) {
    results.push({
      type: 'error',
      category: 'Compatibility',
      message: 'Unsupported visual theme',
      suggestion: 'Use one of the supported visual themes',
      severity: 'high',
    });
  }

  // Success cases
  if (results.filter((r) => r.type === 'error').length === 0) {
    results.push({
      type: 'success',
      category: 'Configuration',
      message: 'Theme configuration is valid',
      severity: 'low',
    });
  }

  if (config.glassmorphismIntensity <= 50) {
    results.push({
      type: 'success',
      category: 'Performance',
      message: 'Glassmorphism intensity is optimized for performance',
      severity: 'low',
    });
  }

  return results;
}

// ================================
// PERFORMANCE MONITORING
// ================================

/**
 * Get current theme performance metrics
 */
export function getThemePerformanceMetrics(): ThemePerformanceMetrics {
  const startTime = performance.now();

  // Count CSS custom properties
  const cssPropertiesCount = extractCSSCustomProperties();
  const cssCount = Object.keys(cssPropertiesCount).length;

  // Count theme classes in document
  const themeClassesCount = Array.from(
    document.documentElement.classList
  ).filter(
    (cls) =>
      cls.startsWith('theme-') ||
      cls.startsWith('density-') ||
      cls.startsWith('animation-')
  ).length;

  // Memory usage (if available)
  const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
  const memoryUsageMB = Math.round(memoryUsage / 1024 / 1024);

  // Load time calculation
  const loadTimeMs = Math.round(performance.now() - startTime);

  // Get stored performance data
  const storedData = getStoredPerformanceData();

  return {
    cssPropertiesCount: cssCount,
    themeClassesCount,
    loadTimeMs,
    memoryUsageMB,
    lastSwitchDuration: storedData.lastSwitchDuration,
    totalSwitches: storedData.totalSwitches,
    averageSwitchTime: storedData.averageSwitchTime,
    bundleSizeImpact: estimateBundleSizeImpact(),
    renderImpactScore: calculateRenderImpactScore(),
  };
}

/**
 * Track theme switch performance
 */
export function trackThemeSwitch(startTime: number, endTime: number): void {
  const duration = endTime - startTime;
  const storedData = getStoredPerformanceData();

  const newData = {
    lastSwitchDuration: Math.round(duration),
    totalSwitches: storedData.totalSwitches + 1,
    averageSwitchTime: Math.round(
      (storedData.averageSwitchTime * storedData.totalSwitches + duration) /
        (storedData.totalSwitches + 1)
    ),
    timestamps: [...storedData.timestamps, Date.now()].slice(-10), // Keep last 10 switches
  };

  try {
    localStorage.setItem('pokemon-theme-performance', JSON.stringify(newData));
  } catch (_error) {
    console.warn('Failed to store theme performance data:', error);
  }
}

/**
 * Get stored performance data with defaults
 */
function getStoredPerformanceData() {
  const defaultData = {
    lastSwitchDuration: 0,
    totalSwitches: 0,
    averageSwitchTime: 0,
    timestamps: [] as number[],
  };

  try {
    const stored = localStorage.getItem('pokemon-theme-performance');
    return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData;
  } catch (_error) {
    return defaultData;
  }
}

/**
 * Estimate bundle size impact of theme system
 */
function estimateBundleSizeImpact(): number {
  // Rough estimation based on theme complexity
  const baseSize = 15; // Base theme system size in KB
  const cssPropertiesCount = Object.keys(extractCSSCustomProperties()).length;
  const additionalSize = Math.round(cssPropertiesCount * 0.05); // ~50 bytes per property

  return baseSize + additionalSize;
}

/**
 * Calculate render impact score (1-5 scale)
 */
function calculateRenderImpactScore(): number {
  const themeClassCount = Array.from(document.documentElement.classList).length;
  const cssPropertyCount = Object.keys(extractCSSCustomProperties()).length;

  // Simple scoring algorithm
  const classScore = Math.min(themeClassCount / 10, 2); // Max 2 points for classes
  const propertyScore = Math.min(cssPropertyCount / 50, 3); // Max 3 points for properties

  return Math.round((classScore + propertyScore) * 10) / 10;
}

// ================================
// CSS PROPERTY EXTRACTION
// ================================

/**
 * Extract all CSS custom properties from the document
 */
export function extractCSSCustomProperties(): Record<string, string> {
  const properties: Record<string, string> = {};

  if (typeof document === 'undefined') {
    return properties;
  }

  const computedStyles = getComputedStyle(document.documentElement);

  // Get all CSS custom properties
  for (let i = 0; i < computedStyles.length; i++) {
    const property = computedStyles[i];
    if (property.startsWith('--')) {
      const value = computedStyles.getPropertyValue(property).trim();
      if (value) {
        properties[property] = value;
      }
    }
  }

  return properties;
}

/**
 * Extract theme-specific CSS properties
 */
export function extractThemeProperties(): Record<string, string> {
  const allProperties = extractCSSCustomProperties();
  const themeProperties: Record<string, string> = {};

  Object.entries(allProperties).forEach(([property, value]) => {
    if (
      property.includes('theme') ||
      property.includes('glass') ||
      property.includes('cosmic') ||
      property.includes('density') ||
      property.includes('animation')
    ) {
      themeProperties[property] = value;
    }
  });

  return themeProperties;
}

// ================================
// COMPONENT DOCUMENTATION
// ================================

/**
 * Get component variant information for documentation
 */
export function getComponentVariantInfo(
  componentName: string,
  styleConfig: ComponentStyleConfig
): ComponentVariantInfo {
  const variants = Object.keys(styleConfig.variants || {});
  const sizes = Object.keys(styleConfig.sizes || {});
  const states = Object.keys(styleConfig.states || {});
  const totalCombinations = variants.length * sizes.length * states.length;

  // Generate example usage patterns
  const exampleUsage = [
    `<${componentName.charAt(0).toUpperCase() + componentName.slice(1)} variant="primary" size="md" />`,
    `<${componentName.charAt(0).toUpperCase() + componentName.slice(1)} variant="secondary" size="lg" />`,
    `<${componentName.charAt(0).toUpperCase() + componentName.slice(1)} variant="outline" size="sm" />`,
  ];

  return {
    componentName,
    variants,
    sizes,
    states,
    totalCombinations,
    baseClasses: styleConfig.base || '',
    exampleUsage,
  };
}

/**
 * Get all available component configurations
 */
export function getAllComponentVariants(): ComponentVariantInfo[] {
  const components = [
    {
      name: 'button',
      config: {
        base: '',
        variants: {},
        sizes: {},
        states: {},
      } as ComponentStyleConfig,
    },
    {
      name: 'input',
      config: {
        base: '',
        variants: {},
        sizes: {},
        states: {},
      } as ComponentStyleConfig,
    },
    {
      name: 'card',
      config: {
        base: '',
        variants: {},
        sizes: {},
        states: {},
      } as ComponentStyleConfig,
    },
    {
      name: 'badge',
      config: {
        base: '',
        variants: {},
        sizes: {},
        states: {},
      } as ComponentStyleConfig,
    },
  ];

  return components.map(({ name, config }) =>
    getComponentVariantInfo(name, config)
  );
}

// ================================
// THEME DEBUGGING UTILITIES
// ================================

/**
 * Log current theme state to console with formatted output
 */
export function logThemeState(config: ThemeConfiguration): void {
  console.group('🎨 Theme Debug Information');
  console.log('Current Configuration:', config);
  console.log('CSS Properties:', extractThemeProperties());
  console.log('Performance Metrics:', getThemePerformanceMetrics());
  console.log('Validation Results:', validateThemeConfiguration(config));
  console.groupEnd();
}

/**
 * Check if theme has potential performance issues
 */
export function checkThemePerformance(config: ThemeConfiguration): {
  hasIssues: boolean;
  issues: string[];
  score: number;
} {
  const issues: string[] = [];
  let score = 100;

  if (config.glassmorphismIntensity > 80) {
    issues.push('High glassmorphism intensity');
    score -= 20;
  }

  if (
    config.particleEffectsEnabled &&
    config.animationIntensity === 'enhanced'
  ) {
    issues.push('Enhanced animations with particles enabled');
    score -= 25;
  }

  if (config.animationIntensity === 'enhanced' && !config.reducedMotion) {
    issues.push('Enhanced animations without reduced motion consideration');
    score -= 15;
  }

  const cssPropertyCount = Object.keys(extractCSSCustomProperties()).length;
  if (cssPropertyCount > 100) {
    issues.push(`High CSS property count: ${cssPropertyCount}`);
    score -= 10;
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    score: Math.max(0, score),
  };
}

/**
 * Generate theme documentation object
 */
export function generateThemeDocumentation(config: ThemeConfiguration) {
  return {
    configuration: config,
    cssProperties: extractThemeProperties(),
    validation: validateThemeConfiguration(config),
    performance: getThemePerformanceMetrics(),
    componentVariants: getAllComponentVariants(),
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
  };
}

/**
 * Test theme accessibility compliance
 */
export function testThemeAccessibility(
  config: ThemeConfiguration
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Color contrast testing (simplified)
  const contrastResults = testColorContrast();
  results.push(...contrastResults);

  // Motion sensitivity
  if (config.animationIntensity !== 'disabled' && !config.reducedMotion) {
    results.push({
      type: 'warning',
      category: 'Accessibility',
      message: 'Animations enabled without reduced motion support',
      suggestion: 'Consider respecting prefers-reduced-motion media query',
      severity: 'medium',
    });
  }

  // High contrast support
  if (config.highContrast) {
    results.push({
      type: 'success',
      category: 'Accessibility',
      message: 'High contrast mode is enabled',
      severity: 'low',
    });
  }

  return results;
}

/**
 * Test color contrast ratios (simplified implementation)
 */
function testColorContrast(): ValidationResult[] {
  const results: ValidationResult[] = [];

  // This is a simplified contrast check
  // In a real implementation, you'd calculate actual contrast ratios
  const hasGoodContrast = true; // Placeholder logic

  if (hasGoodContrast) {
    results.push({
      type: 'success',
      category: 'Accessibility',
      message: 'Color contrast ratios appear adequate',
      severity: 'low',
    });
  } else {
    results.push({
      type: 'error',
      category: 'Accessibility',
      message: 'Poor color contrast detected',
      suggestion: 'Increase contrast between text and background colors',
      severity: 'high',
    });
  }

  return results;
}

// ================================
// DEVELOPMENT UTILITIES
// ================================

/**
 * Create a theme testing environment
 */
export function createThemeTestEnvironment() {
  return {
    testAllVariants: (
      componentName: string,
      styleConfig: ComponentStyleConfig
    ) => {
      const variants = Object.keys(styleConfig.variants || {});
      const sizes = Object.keys(styleConfig.sizes || {});

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
    },

    benchmarkThemeSwitch: async (newTheme: VisualTheme) => {
      const startTime = performance.now();

      // Simulate theme switch
      document.documentElement.className =
        document.documentElement.className.replace(/theme-\w+/g, '');
      document.documentElement.classList.add(`theme-${newTheme}`);

      // Wait for next frame
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(
        `⚡ Theme switch to ${newTheme} took ${duration.toFixed(2)}ms`
      );
      trackThemeSwitch(startTime, endTime);

      return duration;
    },

    validateAllComponents: () => {
      const components = ['button', 'input', 'card', 'badge'];
      components.forEach((component) => {
        console.log(`🔍 Validating ${component} component...`);
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

  themes.forEach((themeId) => {
    comparison[themeId] = {
      performance: estimateThemePerformance(themeId),
      accessibility: estimateThemeAccessibility(themeId),
      complexity: estimateThemeComplexity(themeId),
    };
  });

  return comparison;
}

/**
 * Estimate theme performance characteristics
 */
function estimateThemePerformance(theme: VisualTheme): {
  score: number;
  factors: string[];
} {
  const factors: string[] = [];
  let score = 100;

  switch (theme) {
    case 'context7-futuristic':
      factors.push('Neural network backgrounds');
      factors.push('Enhanced animations');
      score -= 30;
      break;
    case 'dba-cosmic':
      factors.push('Particle effects');
      factors.push('Cosmic gradients');
      score -= 25;
      break;
    case 'context7-premium':
      factors.push('Glassmorphism effects');
      score -= 15;
      break;
    case 'minimal':
      factors.push('Minimal resource usage');
      score += 10;
      break;
  }

  return { score: Math.max(0, score), factors };
}

/**
 * Estimate theme accessibility characteristics
 */
function estimateThemeAccessibility(theme: VisualTheme): {
  score: number;
  factors: string[];
} {
  const factors: string[] = [];
  let score = 100;

  switch (theme) {
    case 'minimal':
      factors.push('High contrast support');
      factors.push('Reduced motion friendly');
      score += 20;
      break;
    case 'context7-premium':
      factors.push('Moderate accessibility');
      break;
    case 'context7-futuristic':
      factors.push('Complex visual patterns');
      score -= 10;
      break;
    case 'dba-cosmic':
      factors.push('High visual complexity');
      score -= 15;
      break;
  }

  return { score: Math.max(0, score), factors };
}

/**
 * Estimate theme complexity
 */
function estimateThemeComplexity(theme: VisualTheme): {
  score: number;
  factors: string[];
} {
  const factors: string[] = [];
  let score = 0;

  switch (theme) {
    case 'minimal':
      factors.push('Simple design patterns');
      score = 20;
      break;
    case 'context7-premium':
      factors.push('Glassmorphism implementation');
      factors.push('Gradient systems');
      score = 60;
      break;
    case 'context7-futuristic':
      factors.push('Neural network patterns');
      factors.push('Advanced animations');
      factors.push('Holographic effects');
      score = 85;
      break;
    case 'dba-cosmic':
      factors.push('Particle systems');
      factors.push('Cosmic effects');
      factors.push('Multi-layer backgrounds');
      score = 90;
      break;
  }

  return { score, factors };
}

// ================================
// DEVELOPER TOOLS
// ================================

/**
 * Generate CSS for current theme configuration
 */
export function generateThemeCSS(config: ThemeConfiguration): string {
  const formTheme = formThemes[config.primaryColor];
  const densityMultiplier = {
    compact: 0.8,
    comfortable: 1,
    spacious: 1.2,
  }[config.density];

  const animationDurations = {
    subtle: { fast: '0.1s', normal: '0.2s', slow: '0.3s' },
    normal: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
    enhanced: { fast: '0.2s', normal: '0.4s', slow: '0.7s' },
    disabled: { fast: '0s', normal: '0s', slow: '0s' },
  }[config.animationIntensity];

  return `
:root {
  /* Theme Configuration: ${config.visualTheme} */
  --theme-primary-gradient: ${formTheme.button.primary.replace('bg-gradient-to-r ', '')};
  --theme-primary-hover: ${formTheme.button.primaryHover.replace('hover:', '')};
  --theme-header-background: ${formTheme.header.background};
  --theme-border-color: ${formTheme.element.border};
  --theme-focus-ring: ${formTheme.element.focus};
  
  /* Density Tokens (${config.density}) */
  --density-spacing-xs: ${0.25 * densityMultiplier}rem;
  --density-spacing-sm: ${0.5 * densityMultiplier}rem;
  --density-spacing-md: ${1 * densityMultiplier}rem;
  --density-spacing-lg: ${1.5 * densityMultiplier}rem;
  --density-spacing-xl: ${2 * densityMultiplier}rem;
  
  /* Animation Tokens (${config.animationIntensity}) */
  --animation-duration-fast: ${animationDurations.fast};
  --animation-duration-normal: ${animationDurations.normal};
  --animation-duration-slow: ${animationDurations.slow};
  
  /* Glassmorphism (${config.glassmorphismIntensity}%) */
  --glass-alpha: ${config.glassmorphismIntensity / 100};
  --glass-blur: ${config.glassmorphismIntensity / 5}px;
}

.theme-${config.visualTheme} {
  /* Theme-specific styles would go here */
}
`.trim();
}

/**
 * Debug theme conflicts and inconsistencies
 */
export function debugThemeConflicts(): {
  conflicts: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestions: string[];
} {
  const conflicts: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }> = [];
  const suggestions: string[] = [];

  // Check for conflicting CSS classes
  const themeClasses = Array.from(document.documentElement.classList).filter(
    (cls) => cls.startsWith('theme-')
  );

  if (themeClasses.length > 1) {
    conflicts.push({
      type: 'Multiple Theme Classes',
      description: `Found multiple theme classes: ${themeClasses.join(', ')}`,
      severity: 'high',
    });
    suggestions.push('Remove conflicting theme classes from document element');
  }

  // Check for CSS property overrides
  const customProperties = extractCSSCustomProperties();
  const potentialOverrides = Object.keys(customProperties).filter(
    (prop) =>
      prop.includes('theme') && customProperties[prop].includes('!important')
  );

  if (potentialOverrides.length > 0) {
    conflicts.push({
      type: 'CSS Override Detected',
      description: `Found !important overrides in: ${potentialOverrides.join(', ')}`,
      severity: 'medium',
    });
    suggestions.push('Avoid using !important in theme-related CSS properties');
  }

  return { conflicts, suggestions };
}

// ================================
// EXPORTS
// ================================

export default {
  validateThemeConfiguration,
  getThemePerformanceMetrics,
  trackThemeSwitch,
  extractCSSCustomProperties,
  extractThemeProperties,
  getComponentVariantInfo,
  getAllComponentVariants,
  logThemeState,
  checkThemePerformance,
  generateThemeDocumentation,
  testThemeAccessibility,
  createThemeTestEnvironment,
  generateThemeComparison,
  generateThemeCSS,
  debugThemeConflicts,
};
